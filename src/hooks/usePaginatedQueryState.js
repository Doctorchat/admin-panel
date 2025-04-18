import { useCallback } from "react";
import { useSessionStorage } from "react-use";

export default function useTableState(
  key = "table-state",
  initialState = { page: 1, sort: "id", sortDirection: "descend" }
) {
  const [page, setPage] = useSessionStorage(key + "__page", initialState.page);
  const [sortColumn, setSortColumn] = useSessionStorage(key + "__sort_column", initialState.sort);
  const [sortDirection, setSortDirection] = useSessionStorage(
    key + "__sort_direction",
    initialState.sortDirection
  );

  const onTableChange = useCallback(
    (pagination, _, sorter) => {
      // Don't update the page here as we're handling it separately
      // in the pagination.onChange handler
      
      if (sorter.order) {
        setSortColumn(sorter.field);
        setSortDirection(sorter.order);
      }
    },
    [setSortColumn, setSortDirection]
  );

  return {
    page,
    sortColumn,
    sortDirection,
    setPage,
    setSortColumn,
    setSortDirection,
    onTableChange,
  };
}
