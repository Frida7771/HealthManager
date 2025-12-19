import PropTypes from 'prop-types';
import { Card, Typography } from 'antd';
import { timeAgo } from '@/utils/time.js';

const NewsCard = ({ news, onClick }) => (
  <Card
    hoverable
    style={{ borderRadius: 16 }}
    cover={
      <img
        alt={news.name}
        src={news.cover}
        style={{ height: 160, objectFit: 'cover', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      />
    }
    onClick={() => onClick?.(news)}
  >
    <Typography.Title level={4} style={{ marginBottom: 8 }}>
      {news.name}
    </Typography.Title>
    <Typography.Text type="secondary">
      {news.tagName} · {timeAgo(news.createTime)}
    </Typography.Text>
  </Card>
);

NewsCard.propTypes = {
  news: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};

NewsCard.defaultProps = {
  onClick: undefined,
};

export default NewsCard;
