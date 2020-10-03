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

export default function UserSignup() {
  const { signup, state: authState, error } = useAuth();
  const history = useHistory();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isValid =
    name.length &&
    email.length &&
    password.length > 7 &&
    confirmPassword === password;

  const handleSubmit = () => {
    if (isValid) {
      signup({ name, email, password }).then(() => history.push("/"));
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
            <Typography.Text type="danger">{error.message}</Typography.Text>
          )}
          <Row justify="end" align="middle">
            <Button
              data-cy="submit"
              disabled={!isValid}
              onClick={handleSubmit}
              loading={authState === "SigningUp"}
              size={"middle"}
              type={"primary"}
            >
              Submit
            </Button>
          </Row>
          <div style={{ border: "1px solid #f0f0f0" }} />
          <Typography.Link onClick={() => history.push("/login")}>
            Already signed up? Click here to log in.
          </Typography.Link>
        </Space>
      </div>
    </Row>
  );
}
