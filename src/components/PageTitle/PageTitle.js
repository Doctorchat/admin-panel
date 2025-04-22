import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';
import './styles/index.scss';

const PageTitle = ({ title, extra }) => {
  return (
    <div className="page-title">
      <Typography.Title level={2}>{title}</Typography.Title>
      {extra && <div className="page-title-extra">{extra}</div>}
    </div>
  );
};

PageTitle.propTypes = {
  title: PropTypes.string.isRequired,
  extra: PropTypes.node,
};

export default PageTitle;