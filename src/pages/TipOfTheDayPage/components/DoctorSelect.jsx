import { useInfiniteQuery } from "react-query";
import { forwardRef, useState } from "react";
import { QUERY_KEYS } from "../../../utils/queryKeys";
import api from "../../../utils/appApi";
import { Select } from "antd";
import PropTypes from "prop-types";

export const DoctorSelect = forwardRef(({ value, onChange, defaultOption }, ref) => {
  const [doctorsList, setDoctorsList] = useState([]);

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [QUERY_KEYS.DOCTORS],
    queryFn: ({ pageParam = 1 }) => api.doctors.get({ page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.next_page_url ? allPages.length + 1 : undefined;
    },
    onSuccess: (data) => {
      const newDoctors = data?.pages?.flatMap((page) => page?.data);
      setDoctorsList(newDoctors);
    },
  });

  const handleScroll = (event) => {
    const target = event.currentTarget;
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 20 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  console.log("defaultOption", defaultOption);

  return (
    <Select
      ref={ref}
      showSearch
      placeholder="Selectează doctor"
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
      value={value}
      onChange={onChange}
      onPopupScroll={handleScroll}
      loading={isFetchingNextPage}
      options={[
        ...(defaultOption && !doctorsList?.some((doctor) => doctor.id === defaultOption.id)
          ? [{ value: defaultOption.id, label: defaultOption.name }]
          : []),
        ...(doctorsList?.map((doctor) => ({ value: doctor.id, label: doctor.name })) || []),
      ]}
    />
  );
});

DoctorSelect.displayName = "DoctorSelect";

DoctorSelect.propTypes = {
  defaultOption: PropTypes.object,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
