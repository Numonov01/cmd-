import {
  Table,
  Card,
  Button,
  Tag,
  Spin,
  Alert,
  Descriptions,
  Switch,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import usePatchManagements from "../../service/PatchManagement";

const PatchManagement = () => {
  const { id } = useParams();
  const { patches, loading, error, pagination, refresh, fetchPage } =
    usePatchManagements();

  const columns = [
    {
      title: "№",
      key: "index",
      width: 50,
      render: (_, __, index) => (pagination.currentPage - 1) * 10 + index + 1,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "KB",
      dataIndex: "kb",
      key: "kb",
    },
    {
      title: "Mandatory",
      dataIndex: "mandatory",
      key: "mandatory",
      render: (mandatory) => (
        <Tag color={mandatory ? "red" : "green"}>
          {mandatory ? "Yes" : "No"}
        </Tag>
      ),
    },
    {
      title: "Downloaded",
      dataIndex: "downloaded",
      key: "downloaded",
      render: (downloaded) => (
        <Tag color={downloaded ? "green" : "orange"}>
          {downloaded ? "Downloaded" : "Not downloaded"}
        </Tag>
      ),
    },
    {
      title: "Reboot required",
      dataIndex: "reboot_required",
      key: "reboot_required",
      render: (reboot_required) => (
        <Tag color={reboot_required ? "red" : "green"}>
          {reboot_required ? "Yes" : "No"}
        </Tag>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <div style={{ padding: "16px", background: "#f9f9f9" }}>
        <Descriptions title="" bordered column={2} size="small">
          <Descriptions.Item label="Device" span={2}>
            {record.id}
          </Descriptions.Item>
          <Descriptions.Item label="Support">
            {record.support}
          </Descriptions.Item>
          <Descriptions.Item label="Update id">
            {record.update_id}
          </Descriptions.Item>
          <Descriptions.Item label="Auto download">
            <Switch size="small" checked={record.download_patch} disabled />
          </Descriptions.Item>
          <Descriptions.Item label="Auto install">
            <Switch size="small" checked={record.install_patch} disabled />
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
            <span>Patch management</span>
            {id && (
              <Tag color="purple" style={{ marginLeft: "10px" }}>
                Device: {id}
              </Tag>
            )}
          </div>
        }
        extra={
          <div>
            <Button
              icon={<ReloadOutlined />}
              onClick={refresh}
              disabled={loading}
              type="primary"
            >
              Refresh
            </Button>
          </div>
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
            closable
            onClose={() => refresh()}
          />
        )}

        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => fetchPage(pagination.previous)}
            disabled={!pagination.previous || loading}
          >
            Previous
          </Button>
          <span style={{ lineHeight: "32px" }}>
            Page {pagination.currentPage} of {Math.ceil(pagination.count / 10)}
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
            dataSource={patches.map((item) => ({ ...item, key: item.id }))}
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
          />
        </Spin>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <p>Total Patches: {pagination.count}</p>
        </div>
      </Card>
    </div>
  );
};

export default PatchManagement;
