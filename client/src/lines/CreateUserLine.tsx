import styled from "@emotion/styled";
import {
  Button,
  InputNumber,
  Modal,
  Radio,
  Space,
  Typography
  } from "antd";
import { RadioChangeEvent } from "antd/lib/radio";
import React from "react";
import { useCreateUserLine } from "./gql";
import Item from "./Line";
import { Selection } from "./utils";

const RADIO_VALUES = [5, 10, 20];
const RADIO_OPTIONS = RADIO_VALUES.map((value) => ({
  label: `$${value}`,
  value,
}));

const AmountContainer = styled.div(() => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

type CreateUserLineProps = {
  selection: Selection;
  handleCancel(): void;
};

export default function CreateUserLine({
  selection,
  handleCancel,
}: CreateUserLineProps) {
  const [createUserLine, { loading }] = useCreateUserLine(selection.line);
  const [amount, setAmount] = React.useState(10);
  const [side, setSide] = React.useState(selection.side);

  function handleOddChange(selection: Selection) {
    setSide(selection.side);
  }

  function handleInputChange(value: string | number | undefined) {
    if (value != null) {
      if (typeof value === "number") {
        setAmount(Math.round(value));
      } else {
        try {
          value = parseInt(value, 10);
          console.log(value);
          setAmount(Math.round(value));
        } catch (_err) {}
      }
    }
  }

  function handleRadioChange(e: RadioChangeEvent) {
    setAmount(e.target.value);
  }

  function handleCreateUserLine() {
    createUserLine({
      variables: {
        userLineInput: {
          line_uid: selection.line.uid,
          amount,
          creator_side: side,
        },
      },
    }).then(handleCancel);
  }

  return (
    <Modal
      title={"Open New Line"}
      centered
      visible={true}
      // onOk={() => this.setModal2Visible(false)}
      width={460}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          disabled={!amount}
          onClick={handleCreateUserLine}
        >
          {loading ? "Opening Line..." : "Open New Line"}
        </Button>,
      ]}
    >
      <Space direction="vertical">
        <Item
          handleClick={handleOddChange}
          line={selection.line}
          sideSelected={side}
        />{" "}
        <AmountContainer>
          <Typography.Text strong>Amount:</Typography.Text>
          <Radio.Group
            options={RADIO_OPTIONS}
            onChange={handleRadioChange}
            value={RADIO_VALUES.includes(amount) ? amount : undefined}
            optionType="button"
            buttonStyle="solid"
          />
          <InputNumber
            value={amount}
            formatter={(value) =>
              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value?.replace(/\$\s?|(,*)/g, "") ?? ""}
            onChange={handleInputChange}
          />
        </AmountContainer>
      </Space>
    </Modal>
  );
}
