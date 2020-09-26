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
import { CurrentUser, UserLoginInput } from "../generated/graphql";

const LOGIN_MUTATION = gql`
  mutation LoginMutation($userLoginInput: UserLoginInput!) {
    userLogin(userLoginInput: $userLoginInput) {
      uid
      name
      email
      token
    }
  }
`;

export default function UserLogin() {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userLogin, { data }] = useMutation<
    {
      userLogin: CurrentUser;
    },
    {
      userLoginInput: UserLoginInput;
    }
  >(LOGIN_MUTATION);

  const isValid = email.length && password.length > 7;

  const handleSubmit = () => {
    userLogin({ variables: { userLoginInput: { email, password } } });
  };

  React.useEffect(() => {
    if (data?.userLogin?.token) {
      localStorage.setItem("token", data.userLogin.token);
      history.push("/");
    }
  }, [data, history]);

  return (
    <Row justify="space-around" align="middle" style={{ height: "100%" }}>
      <div>
        <Typography.Title level={3}>Sign Up</Typography.Title>
        <Space direction="vertical">
          <Input
            placeholder="Email"
            value={email}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(event.target.value)
            }
          />
          <Input.Password
            placeholder="Password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            value={password}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(event.target.value)
            }
          />
          <Row justify="end" align="middle">
            <Button
              disabled={!isValid}
              loading={false}
              onClick={handleSubmit}
              size={"middle"}
              type={"primary"}
            >
              Login
            </Button>
          </Row>
        </Space>
      </div>
    </Row>
  );
}
