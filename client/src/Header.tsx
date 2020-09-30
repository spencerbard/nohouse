import { UserOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Button, Dropdown, Menu } from "antd";
import React from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "./auth";
import logoSmall from "./images/logoSmall.png";

const StyledHeader = styled.div(() => ({
  position: "fixed",
  top: 0,
  left: 0,
  height: "48px",
  width: "100%",
  borderBottom: "1px solid #f8f8f8",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 2px 8px #f0f1f2",
}));

const Logo = styled.img(() => ({
  height: "32px",
  width: "32px",
  marginLeft: "16px",
  cursor: "pointer",
}));

const AuthButton = styled(Button)(() => ({
  marginRight: "16px",
}));

export default function Header() {
  const history = useHistory();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <StyledHeader>
      <Logo
        src={logoSmall}
        onClick={() => history.push("/")}
        alt="NoHouse Logo"
      />
      <div style={{ flex: 1 }}></div>
      {!isAuthenticated && (
        <AuthButton
          onClick={() => history.push("/login")}
          size={"middle"}
          type={"default"}
        >
          Log In
        </AuthButton>
      )}
      {user && (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="logout" onClick={logout}>
                Log Out
              </Menu.Item>
            </Menu>
          }
        >
          <AuthButton type="default" icon={<UserOutlined />}>
            {user.name}
          </AuthButton>
        </Dropdown>
      )}
    </StyledHeader>
  );
}
