import { useInfiniteQuery, useQuery } from "react-query";
import { forwardRef, useState, useCallback, useEffect } from "react";
import { QUERY_KEYS } from "../../../utils/queryKeys";
import api from "../../../utils/appApi";
import { Select, Avatar, Spin } from "antd";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";

export const DoctorSelect = forwardRef(({ value, onChange, defaultOption }, ref) => {
  const [doctorsList, setDoctorsList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Initial doctors loading
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [QUERY_KEYS.DOCTORS, "initial"],
    queryFn: ({ pageParam = 1 }) => api.doctors.get({ page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.next_page_url ? allPages.length + 1 : undefined;
    },
    onSuccess: (data) => {
      if (!searchText) {
        const newDoctors = data?.pages?.flatMap((page) => page?.data);
        setDoctorsList(newDoctors || []);
      }
    },
  });

  // Search doctors
  const { data: searchResults, isFetching: isSearchFetching } = useQuery({
    queryKey: [QUERY_KEYS.DOCTORS, "search", searchText],
    queryFn: () => api.doctors.get({ search: searchText }),
    enabled: !!searchText,
    onSuccess: (data) => {
      if (searchText) {
        setDoctorsList(data?.data || []);
      }
      setIsSearching(false);
    },
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((text) => {
      setSearchText(text);
    }, 500),
    []
  );

  const handleSearch = (value) => {
    if (value) {
      setIsSearching(true);
      debouncedSearch(value);
    } else {
      setSearchText("");
      // Reset to initial doctors list when search is cleared
      fetchNextPage({ pageParam: 1 });
    }
  };

  const handleScroll = (event) => {
    // Only load more on scroll if not searching
    if (!searchText) {
      const target = event.currentTarget;
      if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 20 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  // Ensure defaultOption is included in options if provided
  useEffect(() => {
    if (defaultOption && !doctorsList.some(doctor => doctor.id === defaultOption.id)) {
      setDoctorsList(prevList => [
        { id: defaultOption.id, name: defaultOption.name, avatar: defaultOption.avatar },
        ...prevList
      ]);
    }
  }, [defaultOption]);

  return (
    <Select
      ref={ref}
      showSearch
      placeholder="Selectează doctor"
      optionFilterProp="label"
      filterOption={false} // Disable client-side filtering to use server-side
      value={value}
      onChange={onChange}
      onSearch={handleSearch}
      onPopupScroll={handleScroll}
      loading={isFetchingNextPage || isSearchFetching || isSearching}
      notFoundContent={isSearchFetching ? <Spin size="small" /> : "Nu s-au găsit doctori"}
      optionLabelProp="label"
      allowClear
      options={doctorsList.map((doctor) => ({
        value: doctor.id,
        label: doctor.name,
        data: doctor,
      }))}
      optionRender={(option) => (
        <div className="tw-flex tw-items-center tw-gap-2">
          <Avatar 
            size="small" 
            src={option.data.avatar} 
            style={{ flexShrink: 0 }}
          />
          <div className="tw-truncate">{option.data.name}</div>
        </div>
      )}
    />
  );
});

DoctorSelect.displayName = "DoctorSelect";

DoctorSelect.propTypes = {
  defaultOption: PropTypes.object,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
