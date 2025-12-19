import { useEffect, useState } from 'react';
import { Button, Col, Rate, Row, Space, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import client from '@/api/client.js';
import { timeAgo } from '@/utils/time.js';
import NewsCard from '@/components/NewsCard.jsx';
import Comments from '@/components/Comments.jsx';

const NewsDetail = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState(() => {
    const cache = sessionStorage.getItem('newsInfo');
    return cache ? JSON.parse(cache) : null;
  });
  const [saveFlag, setSaveFlag] = useState(false);
  const [topList, setTopList] = useState([]);
  const [score, setScore] = useState(0);
  const [existingScore, setExistingScore] = useState(null);

  useEffect(() => {
    if (!news) {
      navigate('/user/news-record');
      return;
    }
    loadSaveStatus(news.id);
    loadRecommend();
    loadScore(news.id);
  }, [news]);

  const loadSaveStatus = async id => {
    const { data } = await client.post('/news-save/queryUser', { newsId: id });
    if (data.code === 200) {
      setSaveFlag(data.data.length !== 0);
    }
  };

  const loadRecommend = async () => {
    const { data } = await client.get('/news/queryRecommend/3');
    if (data.code === 200) {
      setTopList(data.data);
    }
  };

  const loadScore = async id => {
    const { data } = await client.post('/score/query', { articleId: id });
    if (data.code === 200 && data.data.length) {
      setExistingScore(data.data[0].total);
    } else {
      setExistingScore(null);
    }
  };

  const handleToggleSave = async () => {
    const { data } = await client.post('/news-save/operation', { newsId: news.id });
    if (data.code === 200) {
      setSaveFlag(prev => !prev);
      message.success(!saveFlag ? 'collect success' : 'cancel collect success');
    }
  };

  const handleScore = async value => {
    setScore(value);
    const payload = { total: value, articleId: news.id };
    const { data } = await client.post('/score/save', payload);
    if (data.code === 200) {
      message.success('score success');
      loadScore(news.id);
    }
  };

  const handleNewsClick = item => {
    sessionStorage.setItem('newsInfo', JSON.stringify(item));
    setNews(item);
  };

  if (!news) {
    return null;
  }

  return (
    <Row gutter={32}>
      <Col xs={24} lg={18}>
        <div>
          <Typography.Title level={1}>{news.name}</Typography.Title>
          <Space style={{ fontSize: 14, marginBottom: 16 }}>
            <span className="news-tags">{news.tagName}</span>
            <span>{timeAgo(news.createTime)}</span>
            <Button size="small" onClick={handleToggleSave}>
              {saveFlag ? 'cancel collect' : 'collect'}
            </Button>
          </Space>
          <div dangerouslySetInnerHTML={{ __html: news.content }} />
        </div>
        <Comments contentId={Number(news.id)} contentType="NEWS" />
      </Col>
      <Col xs={24} lg={6}>
        <div style={{ marginBottom: 24 }}>
          <Typography.Title level={4}>{existingScore ? 'my score' : 'score now'}</Typography.Title>
          {existingScore ? (
            <Rate disabled value={existingScore} allowHalf />
          ) : (
            <Rate value={score} onChange={handleScore} allowHalf />
          )}
        </div>
        <Typography.Title level={4}>news recommendation</Typography.Title>
        {topList.map(item => (
          <div key={item.id} style={{ marginBottom: 16 }}>
            <NewsCard news={item} onClick={handleNewsClick} />
          </div>
        ))}
      </Col>
    </Row>
  );
};

export default NewsDetail;
