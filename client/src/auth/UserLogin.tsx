import { useAuth } from ".";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import {
  Button,
  Input,
  Row,
  Space,
  Typography
  } from "antd";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";

export default function UserLogin() {
  const history = useHistory();
  const { login, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isValid = email.length && password.length > 7;

  async function handleSubmit() {
    if (isValid) {
      await login({ email, password });
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Row
      onKeyPress={handleKeyPress}
      justify="space-around"
      align="middle"
      style={{ height: "100%" }}
    >
      <div>
        <Typography.Title level={3}>Log In</Typography.Title>
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
          {error && (
            <Typography.Text type="danger">{error.message}</Typography.Text>
          )}
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
          <div style={{ border: "1px solid #f0f0f0" }} />
          <Typography.Link
            style={{ textAlign: "center" }}
            onClick={() => history.push("/signup")}
          >
            Need an account? Click here to sign up.
          </Typography.Link>
        </Space>
      </div>
    </Row>
  );
}
