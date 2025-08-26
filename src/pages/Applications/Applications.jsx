// src/pages/Applications/Applications.jsx
import { Table, Card, Button, Tag, Spin, Alert, Tooltip, Select } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import useApplications from "../../service/Applications";
import { useState, useEffect } from "react";
import useHostDevices from "../../service/HostDevices";

const Applications = () => {
  const { id } = useParams();
  const [selectedDevice, setSelectedDevice] = useState(id || null);

  // device bo‘yicha applications chaqiramiz
  const { apps, loading, error, pagination, refresh, fetchPage } =
    useApplications(selectedDevice);

  const { devices } = useHostDevices();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  useEffect(() => {
    // agar url'dan id kelsa, selectda avtomatik tanlab qo‘yiladi
    if (id) {
      setSelectedDevice(id);
    }
  }, [id]);

  const columns = [
    {
      title: "№",
      key: "index",
      width: 60,
      render: (_, __, index) => (pagination.currentPage - 1) * 10 + index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Image path",
      dataIndex: "image_path",
      key: "image_path",
      render: (id) => (
        <Tooltip title={id}>
          <span className="monospace">{id.substring(0, 20)}...</span>
        </Tooltip>
      ),
    },
    {
      title: "Pid",
      dataIndex: "pid",
      key: "pid",
    },
    {
      title: "Sent",
      dataIndex: "sent",
      key: "sent",
      render: (sent) => (sent / 1024).toFixed(2) + " KB",
    },
    {
      title: "Received",
      dataIndex: "received",
      key: "received",
      render: (received) => (received / 1024).toFixed(2) + " KB",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => formatDate(date),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>Applications </span>
            {selectedDevice && (
              <Tag color="purple" style={{ marginLeft: "10px" }}>
                Device: {selectedDevice}
              </Tag>
            )}
          </div>
        }
        extra={
          <div style={{ display: "flex", gap: "8px" }}>
            <Select
              placeholder="Select a device"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => {
                setSelectedDevice(value);
              }}
              value={selectedDevice}
            >
              {devices.map((device) => (
                <Select.Option key={device.id} value={device.id}>
                  {device.name || device.id}
                </Select.Option>
              ))}
            </Select>

            <Button
              icon={<ReloadOutlined />}
              onClick={() => refresh(selectedDevice)}
              disabled={loading}
              type="primary"
            >
              Refresh
            </Button>
          </div>
        }
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

        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => fetchPage(pagination.previous, selectedDevice)}
            disabled={!pagination.previous || loading}
          >
            Previous
          </Button>
          <span style={{ lineHeight: "32px" }}>
            Page {pagination.currentPage} of {Math.ceil(pagination.count / 10)}
          </span>
          <Button
            onClick={() => fetchPage(pagination.next, selectedDevice)}
            disabled={!pagination.next || loading}
          >
            Next
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={apps.map((item) => ({ ...item, key: item.id }))}
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Spin>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <p>Total Rules: {pagination.count}</p>
        </div>
      </Card>
    </div>
  );
};

export default Applications;
