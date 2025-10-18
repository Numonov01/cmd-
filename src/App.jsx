import { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Spin } from "antd";
import {
  DesktopOutlined,
  FileOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import Router from "./router";
import { useAuth } from "./context/AuthContext";

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem(<Link to={"/dashboard"}>Dashboard</Link>, "1", <DesktopOutlined />),
  getItem(<Link to={"/files"}>Files</Link>, "2", <FileOutlined />),
  getItem("User", "sub1", <UserOutlined />, [
    getItem(<Link to={"/user/tom"}>Tom</Link>, "3"),
    getItem(<Link to={"/user/bill"}>Bill</Link>, "4"),
    getItem(<Link to={"/user/alex"}>Alex</Link>, "5"),
  ]),
];

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, loading } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const menu = (
    <Menu>
      <Menu.Item key="0" icon={<UserOutlined />}>
        <Link to="/user/tom">Profile</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="1" 
        icon={<LogoutOutlined />} 
        onClick={handleLogout}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Router />;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{ background: "white" }}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="light"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={items}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 20px",
            background: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src="../edr_logo.png"
              alt="icon"
              style={{ width: 55, marginRight: 10 }}
            />
            <h3 style={{ margin: 0 }}>Testing</h3>
          </div>
            <Dropdown overlay={menu} trigger={["click"]}>
              <a onClick={(e) => e.preventDefault()} href="/">
                <Avatar src="../Boy.png" size={50} />
              </a>
            </Dropdown>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, background: "white", borderRadius: 8 }}>
            <Router />
          </div>
        </Content>
         <Footer
          style={{
            textAlign: "center",
            background: "#fff",
            height: 50,
          }}
        >
          EDR ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;