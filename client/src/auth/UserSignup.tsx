import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { gql, useMutation } from "@apollo/client";
import {
  Button,
  Input,
  Row,
  Space,
  Typography
  } from "antd";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { CurrentUser, UserSignupInput } from "../generated/graphql";

const USER_SIGNUP_MUTATION = gql`
  mutation UserSignupMutation($userSignupInput: UserSignupInput!) {
    userSignup(userSignupInput: $userSignupInput) {
      token
    }
  }
`;

export default function UserSignup() {
  const history = useHistory();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userSignup, { data, loading, error }] = useMutation<
    {
      userSignup: CurrentUser;
    },
    { userSignupInput: UserSignupInput }
  >(USER_SIGNUP_MUTATION, { errorPolicy: "all" });

  const isValid =
    name.length &&
    email.length &&
    password.length > 7 &&
    confirmPassword === password;

  React.useEffect(() => {
    if (data?.userSignup) {
      localStorage.setItem("token", data?.userSignup.token);
      history.push("/");
    }
  }, [data, history]);

  const handleSubmit = () => {
    if (isValid) {
      userSignup({ variables: { userSignupInput: { name, email, password } } });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Row justify="space-around" align="middle" style={{ height: "100%" }}>
      <div onKeyPress={handleKeyPress}>
        <Typography.Title level={3}>Sign Up</Typography.Title>
        <Space direction="vertical">
          <Input
            data-cy="name"
            placeholder="Name"
            value={name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setName(event.target.value)
            }
          />
          <Input
            data-cy="email"
            placeholder="Email"
            value={email}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(event.target.value)
            }
          />
          <Input.Password
            data-cy="password"
            placeholder="Password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            value={password}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(event.target.value)
            }
          />
          <Input.Password
            data-cy="confirm"
            placeholder="Confirm Password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            value={confirmPassword}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(event.target.value)
            }
          />
          {error && (
            <Typography.Text type="danger">{error.toString()}</Typography.Text>
          )}
          <Row justify="end" align="middle">
            <Button
              data-cy="submit"
              disabled={!isValid}
              onClick={handleSubmit}
              loading={loading}
              size={"middle"}
              type={"primary"}
            >
              Submit
            </Button>
          </Row>
        </Space>
      </div>
    </Row>
  );
}
