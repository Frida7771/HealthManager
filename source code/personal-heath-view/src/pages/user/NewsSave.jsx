import { useEffect, useState } from 'react';
import { Col, Empty, Row } from 'antd';
import { useNavigate } from 'react-router-dom';
import client from '@/api/client.js';
import NewsCard from '@/components/NewsCard.jsx';

const NewsSave = () => {
  const [newsSaveList, setNewsSaveList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedNews();
  }, []);

  const loadSavedNews = async () => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || 'null');
    if (!userInfo) return;
    const { data } = await client.post('/news-save/query', { userId: userInfo.id });
    if (data.code === 200) {
      setNewsSaveList(data.data);
    }
  };

  const handleClick = newsSave => {
    const news = {
      id: newsSave.newsId,
      name: newsSave.name,
      content: newsSave.content,
      createTime: newsSave.createTime,
      tagName: newsSave.tagName,
    };
    sessionStorage.setItem('newsInfo', JSON.stringify(news));
    navigate('/user/news-detail');
  };

  if (!newsSaveList.length) {
    return <Empty description="no collected news" />;
  }

  return (
    <Row gutter={[16, 16]}>
      {newsSaveList.map(item => (
        <Col xs={24} sm={12} lg={6} key={item.id}>
          <NewsCard news={item} onClick={() => handleClick(item)} />
        </Col>
      ))}
    </Row>
  );
};

export default NewsSave;
