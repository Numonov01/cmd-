import {
  Table,
  Card,
  Button,
  Tag,
  Spin,
  Alert,
  Descriptions,
  Typography,
} from "antd";
import { ReloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import useApplicationConnections from "../../service/ApplicationConnections";

const { Text } = Typography;

const ApplicationConnections = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { connections, loading, error, pagination, refresh, fetchPage } =
    useApplicationConnections(id);

  const handleBack = () => {
    navigate(-1);
  };

  const columns = [
    {
      title: "№",
      key: "index",
      width: 60,
      render: (_, __, index) => (pagination.currentPage - 1) * 10 + index + 1,
    },
    // {
    //   title: "ID",
    //   dataIndex: "id",
    //   key: "id",
    //   width: 100,
    //   render: (id) => (
    //     <Text ellipsis={{ tooltip: id }}>{id.substring(0, 8)}...</Text>
    //   ),
    // },
    {
      title: "Local address",
      dataIndex: "local_address",
      key: "local_address",
      render: (address) => address || "N/A",
    },
    {
      title: "Remote address",
      dataIndex: "remote_address",
      key: "remote_address",
      render: (address) => address || "N/A",
    },
    {
      title: "Direction",
      dataIndex: "direction",
      key: "direction",
      render: (direction) => (
        <Tag color={direction === "Outbound" ? "blue" : "green"}>
          {direction}
        </Tag>
      ),
    },
    {
      title: "Application",
      dataIndex: ["application", "name"],
      key: "app_name",
      render: (name) => name || "Unknown",
    },
    {
      title: "Sent/Received",
      key: "data",
      render: (_, record) => (
        <span>
          {record.application?.sent || "0"} /{" "}
          {record.application?.received || "0"}
        </span>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <div style={{ padding: "16px", background: "#f9f9f9" }}>
        <Descriptions title="" bordered column={2} size="small">
          <Descriptions.Item label="Connection id" span={2}>
            {record.id}
          </Descriptions.Item>
          <Descriptions.Item label="Local address">
            {record.local_address}
          </Descriptions.Item>
          <Descriptions.Item label="Remote address">
            {record.remote_address}
          </Descriptions.Item>
          <Descriptions.Item label="Direction">
            <Tag color={record.direction === "Outbound" ? "blue" : "green"}>
              {record.direction}
            </Tag>
          </Descriptions.Item>

          {record.application && (
            <>
              <Descriptions.Item label="Application name" span={2}>
                {record.application.name}
              </Descriptions.Item>
              <Descriptions.Item label="Application id">
                {record.application.id}
              </Descriptions.Item>
              <Descriptions.Item label="Host">
                {record.application.host}
              </Descriptions.Item>
              <Descriptions.Item label="IP address">
                {record.application.ip_address}
              </Descriptions.Item>
              <Descriptions.Item label="PID">
                {record.application.pid}
              </Descriptions.Item>
              <Descriptions.Item label="Image path">
                <Text ellipsis={{ tooltip: record.application.image_path }}>
                  {record.application.image_path}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Created date">
                {new Date(record.application.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Updated date">
                {new Date(record.application.updated_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Data sent">
                {record.application.sent} bytes
              </Descriptions.Item>
              <Descriptions.Item label="Data received">
                {record.application.received} bytes
              </Descriptions.Item>
            </>
          )}

          <Descriptions.Item label="Additional info" span={2}>
            <pre style={{ margin: 0, maxHeight: "200px", overflow: "auto" }}>
              {record.more_info
                ? JSON.stringify(record.more_info, null, 2)
                : "No additional information available"}
            </pre>
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  };

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{ marginRight: "16px" }}
            >
              Back
            </Button>
            <span>Application connections</span>
            {id && (
              <Tag color="purple" style={{ marginLeft: "10px" }}>
                {id}
              </Tag>
            )}
          </div>
        }
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={refresh}
            disabled={loading}
            type="primary"
          >
            Refresh
          </Button>
        }
        style={{
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
        }}
      >
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )}

        {/* Pagination controls */}
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            onClick={() => fetchPage(pagination.previous)}
            disabled={!pagination.previous || loading}
          >
            Previous
          </Button>
          <span style={{ lineHeight: "32px" }}>
            Page {pagination.currentPage} of{" "}
            {pagination.count > 0 ? Math.ceil(pagination.count / 10) : 1}
          </span>
          <Button
            onClick={() => fetchPage(pagination.next)}
            disabled={!pagination.next || loading}
          >
            Next
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={connections.map((item, index) => ({
              ...item,
              key: item.id || `connection-${index}`,
            }))}
            pagination={false}
            scroll={{ x: 1000 }}
            style={{
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)",
            }}
            expandable={{
              expandedRowRender,
              rowExpandable: () => true,
            }}
            locale={{
              emptyText: loading
                ? "Loading..."
                : "No connection data available",
            }}
          />
        </Spin>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <p>Total connections: {pagination.count}</p>
        </div>
      </Card>
    </div>
  );
};

export default ApplicationConnections;
