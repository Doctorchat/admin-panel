import { Button, Table } from "antd";
import { useState } from "react";
import { useQuery } from "react-query";

import useTableState from "../../../hooks/usePaginatedQueryState";
import api from "../../../utils/appApi";
import date from "../../../utils/date";
import UserDetails from "./UserDetails";
import DcTable from "../../../components/DcTabel";

export default function ActiveCalls() {
  const { page, sortColumn, sortDirection, onTableChange } = useTableState("active-calls");

  const [user, setUser] = useState(null);

  const {
    data: activeCalls,
    isLoading,
    refetch,
  } = useQuery(["active-calls", page, sortColumn, sortDirection], () =>
    api.calls.active({
      page,
      sort_column: sortColumn,
      sort_direction: sortDirection === "ascend" ? "asc" : "desc",
    })
  );

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: true,
      sortOrder: sortColumn === "id" && sortDirection,
    },
    {
      title: "Nume",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Data înregistrării",
      dataIndex: "created_at",
      sorter: true,
      sortOrder: sortColumn === "created_at" && sortDirection,
      render: (rowData) => date(rowData).full,
    },
    {
      title: "Acțiuni",
      width: 100,
      render: (_, record) => (
        <Button type="primary" onClick={() => setUser(record)}>
          Închide
        </Button>
      ),
    },
  ];

  // Render with fallback in case of issues
  const renderTable = () => {
    try {
      return (
        <DcTable
          dataSource={activeCalls?.data || []}
          dataColumns={columns}
          pagination={{
            current_page: activeCalls?.current_page || 1,
            per_page: activeCalls?.per_page || 20,
            total: activeCalls?.total || 0,
            position: ["bottomRight"]
          }}
          loading={isLoading}
          onTableChange={onTableChange}
        />
      );
    } catch (error) {
      console.error("Error rendering DcTable:", error);
      // Fallback to original table
      return (
        <Table
          bordered
          scroll={{ x: 700 }}
          size="small"
          rowKey={(record) => record.id}
          sortDirections={["descend", "ascend", "descend"]}
          columns={columns}
          dataSource={activeCalls?.data || []}
          loading={isLoading}
          pagination={{
            position: ["bottomRight"],
            current: activeCalls?.current_page || 1,
            pageSize: activeCalls?.per_page || 20,
            total: activeCalls?.total || 0,
            showSizeChanger: false,
          }}
          onChange={onTableChange}
        />
      );
    }
  };

  return (
    <>
      <UserDetails
        user={user}
        onClose={() => {
          setUser(null);
          refetch();
        }}
      />

      {renderTable()}
    </>
  );
}
