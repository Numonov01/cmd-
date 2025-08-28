// src/pages/IpAddress/IpAddress.jsx
import { useMemo, useState } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import { ArcLayer } from "@deck.gl/layers";
import {
  Spin,
  Alert,
  Card,
  List,
  Typography,
  Divider,
  Pagination,
  Button,
  Tag,
  Row,
  Col,
  Skeleton,
} from "antd";
import {
  CloseOutlined,
  ReloadOutlined,
  UploadOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import useHostDevices from "../../service/HostDevices";
import useConnectionMapIpAddress from "../../service/MapIpAddress";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

function CustomMapIpAddress() {
  const {
    maps,
    loading,
    partialLoading,
    error,
    pagination,
    fetchPage,
    refresh,
  } = useConnectionMapIpAddress();
  const { loading: devicesLoading } = useHostDevices();
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [showConnectionDetails, setShowConnectionDetails] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filter out connections that are still loading or don't have valid coordinates
  const validConnections = useMemo(() => {
    return maps.filter(
      (d) =>
        !d.more_info.loading &&
        d.more_info?.local_address &&
        d.more_info?.remote_address &&
        d.more_info.local_address.latitude &&
        d.more_info.remote_address.latitude
    );
  }, [maps]);

  // Xarita markazlash
  const viewState = useMemo(() => {
    const coords = validConnections
      .flatMap((d) => [d.more_info?.local_address, d.more_info?.remote_address])
      .filter((loc) => loc && loc.latitude && loc.longitude);

    if (coords.length === 0) {
      return { longitude: 0, latitude: 20, zoom: 1.5, pitch: 30, bearing: 0 };
    }

    const avgLat =
      coords.reduce((sum, c) => sum + c.latitude, 0) / coords.length;
    const avgLng =
      coords.reduce((sum, c) => sum + c.longitude, 0) / coords.length;

    return {
      longitude: avgLng,
      latitude: avgLat,
      zoom: 2,
      pitch: 30,
      bearing: 0,
    };
  }, [validConnections]);

  // Layerlar - only show connections that have loaded
  const layers = useMemo(() => {
    const arcs = validConnections.map((d) => ({
      ...d,
      source: [
        d.more_info.local_address.longitude,
        d.more_info.local_address.latitude,
      ],
      target: [
        d.more_info.remote_address.longitude,
        d.more_info.remote_address.latitude,
      ],
      id: d.id, // Use original index as ID
    }));

    return [
      new ArcLayer({
        id: "arc-layer",
        data: arcs,
        getSourcePosition: (d) => d.source,
        getTargetPosition: (d) => d.target,
        getSourceColor: (d) =>
          selectedConnection && selectedConnection.id === d.id
            ? [255, 255, 0]
            : [0, 128, 255],
        getTargetColor: (d) =>
          selectedConnection && selectedConnection.id === d.id
            ? [255, 215, 0]
            : [255, 0, 128],
        getWidth: (d) =>
          selectedConnection && selectedConnection.id === d.id ? 5 : 3,
        pickable: true,
        onClick: (info) => {
          if (info.object) setSelectedConnection(info.object);
        },
      }),
    ];
  }, [validConnections, selectedConnection]);

  const handlePageChange = (page, pageSize) => {
    const url = pagination.next
      ? pagination.next.replace(/page=\d+/, `page=${page}`)
      : `${
          import.meta.env.VITE_SERVER_URL
        }applications/connections/?page=${page}&page_size=${pageSize}`;
    fetchPage(url);
  };

  // Format bytes to human readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0 || !bytes) return "0 B";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Count loaded and loading connections
  const loadedCount = maps.filter((m) => !m.more_info.loading).length;
  const totalCount = maps.length;

  if (loading || devicesLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      {!sidebarCollapsed && (
        <div
          style={{
            width: "30%",
            padding: "16px",
            overflowY: "auto",
            boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Typography.Title level={4} style={{ margin: 0 }}>
              Connections list
              {partialLoading && (
                <div
                  style={{ fontSize: 12, color: "#666", fontWeight: "normal" }}
                >
                  Loading... ({loadedCount}/{totalCount})
                </div>
              )}
            </Typography.Title>
            <div>
              <Button
                icon={<ReloadOutlined />}
                onClick={refresh}
                loading={partialLoading}
                style={{ marginRight: 8 }}
              >
                Refresh
              </Button>
              <Button
                icon={<MenuFoldOutlined />}
                onClick={() => setSidebarCollapsed(true)}
                type="text"
              />
            </div>
          </div>

          <List
            itemLayout="horizontal"
            dataSource={maps}
            style={{ flex: 1 }}
            renderItem={(item, index) => (
              <List.Item
                onClick={() => setSelectedConnection({ ...item, id: item.id })}
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    selectedConnection && selectedConnection.id === item.id
                      ? "#e6f7ff"
                      : "white",
                  padding: "8px",
                  borderRadius: "4px",
                  marginBottom: "8px",
                  opacity: item.more_info.loading ? 0.6 : 1,
                }}
              >
                {item.more_info.loading ? (
                  <List.Item.Meta
                    title={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Spin size="small" style={{ marginRight: 8 }} />
                        <span>Connection {index + 1} (Loading...)</span>
                        {item.count > 1 && (
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            {item.count} connections
                          </Tag>
                        )}
                      </div>
                    }
                    description={
                      <Skeleton
                        active
                        paragraph={{ rows: 2 }}
                        title={false}
                        size="small"
                      />
                    }
                  />
                ) : (
                  <List.Item.Meta
                    title={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span>{item.application.name}</span>
                        {item.count > 1 && (
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            {item.count} connections
                          </Tag>
                        )}
                        <Tag
                          color={
                            item.direction === "Outbound" ? "red" : "green"
                          }
                          style={{ marginLeft: 8 }}
                        >
                          {item.direction}
                        </Tag>
                      </div>
                    }
                    description={
                      <>
                        <div>
                          <strong>From:</strong>{" "}
                          {item.more_info?.local_address?.city || "Unknown"},{" "}
                          {item.more_info?.local_address?.country || "Unknown"}
                        </div>
                        <div>
                          <strong>To:</strong>{" "}
                          {item.more_info?.remote_address?.city || "Unknown"},{" "}
                          {item.more_info?.remote_address?.country || "Unknown"}
                        </div>
                        <div>
                          <strong>Host:</strong>{" "}
                          {item.application?.host || "Unknown"}
                        </div>
                        {item.application && (
                          <div style={{ marginTop: 8 }}>
                            <Row gutter={8}>
                              <Col span={12}>
                                <UploadOutlined
                                  style={{ color: "#52c41a", marginRight: 4 }}
                                />
                                <small>
                                  {formatBytes(item.application.sent)} sent
                                </small>
                              </Col>
                              <Col span={12}>
                                <DownloadOutlined
                                  style={{ color: "#1890ff", marginRight: 4 }}
                                />
                                <small>
                                  {formatBytes(item.application.received)}{" "}
                                  received
                                </small>
                              </Col>
                            </Row>
                          </div>
                        )}
                      </>
                    }
                  />
                )}
              </List.Item>
            )}
          />

          {/* Pagination */}
          <div
            style={{
              marginTop: "auto",
              padding: "16px 0",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Pagination
              current={pagination.currentPage}
              total={pagination.count}
              pageSize={10}
              onChange={handlePageChange}
              showSizeChanger={false}
              disabled={partialLoading}
            />
          </div>
        </div>
      )}

      {/* Collapsed sidebar button */}
      {sidebarCollapsed && (
        <div
          style={{
            width: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: "20px",
            boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
          }}
        >
          <Button
            icon={<MenuUnfoldOutlined />}
            onClick={() => setSidebarCollapsed(false)}
            type="text"
            size="large"
          />
        </div>
      )}

      {/* Map */}
      <div
        style={{
          width: sidebarCollapsed ? "calc(100% - 50px)" : "70%",
          position: "relative",
        }}
      >
        <DeckGL
          initialViewState={viewState}
          controller={true}
          layers={layers}
          style={{ width: "100%", height: "100%" }}
          getTooltip={({ object }) =>
            object &&
            `From: ${object.more_info?.local_address?.city || "Unknown"}\nTo: ${
              object.more_info?.remote_address?.city || "Unknown"
            }`
          }
        >
          <Map mapStyle={MAP_STYLE} />
        </DeckGL>

        {partialLoading && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "rgba(255,255,255,0.9)",
              padding: "8px 16px",
              borderRadius: "4px",
              zIndex: 100,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Spin size="small" style={{ marginRight: 8 }} />
            Loading IP addresses... ({loadedCount}/{totalCount})
          </div>
        )}

        {/* Details Card */}
        {selectedConnection && (
          <Card
            title={`Host: ${selectedConnection.application?.host || "Unknown"}`}
            bordered={false}
            style={{
              width: 380,
              position: "absolute",
              top: 10,
              right: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              zIndex: 100,
            }}
            extra={
              <CloseOutlined
                onClick={() => setSelectedConnection(null)}
                style={{ cursor: "pointer" }}
              />
            }
          >
            {selectedConnection.more_info.loading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  Loading connection details...
                </div>
              </div>
            ) : (
              <>
                <Divider orientation="left">Local Address</Divider>
                <p style={{ marginBottom: 8 }}>
                  <strong>From:</strong>{" "}
                  {selectedConnection.more_info?.local_address?.city ||
                    "Unknown"}
                  ,{" "}
                  {selectedConnection.more_info?.local_address?.country ||
                    "Unknown"}
                </p>
                <p style={{ marginBottom: 8 }}>
                  <strong>IP:</strong>{" "}
                  {selectedConnection.more_info?.local_address?.ip || "N/A"}
                </p>
                <p style={{ marginBottom: 8 }}>
                  <strong>ISP:</strong>{" "}
                  {selectedConnection.more_info?.local_address?.isp || "N/A"}
                </p>
                <p style={{ marginBottom: 8 }}>
                  <strong>ASN:</strong>{" "}
                  {selectedConnection.more_info?.local_address?.asn || "N/A"}
                </p>

                <Divider orientation="left">Remote Address</Divider>
                <p style={{ marginBottom: 8 }}>
                  <strong>To:</strong>{" "}
                  {selectedConnection.more_info?.remote_address?.city ||
                    "Unknown"}
                  ,{" "}
                  {selectedConnection.more_info?.remote_address?.country ||
                    "Unknown"}
                </p>
                <p style={{ marginBottom: 8 }}>
                  <strong>IP:</strong>{" "}
                  {selectedConnection.more_info?.remote_address?.ip || "N/A"}
                </p>
                <p style={{ marginBottom: 8 }}>
                  <strong>ISP:</strong>{" "}
                  {selectedConnection.more_info?.remote_address?.isp || "N/A"}
                </p>
                <p style={{ marginBottom: 0 }}>
                  <strong>ASN:</strong>{" "}
                  {selectedConnection.more_info?.remote_address?.asn || "N/A"}
                </p>
              </>
            )}

            <InfoCircleOutlined
              onClick={() => setShowConnectionDetails(!showConnectionDetails)}
              style={{
                marginBottom: 16,
                cursor: "pointer",
                color: showConnectionDetails ? "#1890ff" : "#e41414ff",
              }}
            />

            {/* Connection Details Content */}
            {showConnectionDetails && selectedConnection.application && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  background: "#fafafa",
                  borderRadius: 4,
                  border: "1px solid #e8e8e8",
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  <strong>Created Date:</strong>{" "}
                  {new Date(
                    selectedConnection.application.created_at
                  ).toLocaleString()}
                </p>
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  <strong>Image Path:</strong>{" "}
                  {selectedConnection.application.image_path}
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                  <strong>PID:</strong> {selectedConnection.application.pid}
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

export default CustomMapIpAddress;
