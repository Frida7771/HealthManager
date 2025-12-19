import { useEffect, useState } from 'react';
import { Col, Empty, Row } from 'antd';
import { useNavigate } from 'react-router-dom';
import client from '@/api/client.js';
import Banner from '@/components/Banner.jsx';
import TagLine from '@/components/TagLine.jsx';
import NewsCard from '@/components/NewsCard.jsx';

const NewsFeed = () => {
  const [tags, setTags] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [bannerNews, setBannerNews] = useState([]);
  const [topList, setTopList] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTags();
    loadNews();
    loadRecommend();
    loadManualRecommend();
  }, []);

  const persistAndNavigate = news => {
    sessionStorage.setItem('newsInfo', JSON.stringify(news));
    navigate('/user/news-detail');
  };

  const loadTags = async () => {
    const { data } = await client.post('/tags/query', {});
    if (data.code === 200) {
      setTags([{ id: null, name: 'all' }, ...data.data]);
    }
  };

  const loadNews = async tagId => {
    const payload = { tagId: tagId ?? activeTag };
    const { data } = await client.post('/news/query', payload);
    if (data.code === 200) {
      setNewsList(data.data);
    }
  };

  const loadRecommend = async () => {
    const { data } = await client.get('/news/queryRecommend/4');
    if (data.code === 200) {
      setBannerNews(data.data);
    }
  };

  const loadManualRecommend = async () => {
    const payload = { isTop: true, size: 4, current: 1 };
    const { data } = await client.post('/news/query', payload);
    if (data.code === 200) {
      setTopList(data.data);
    }
  };

  const handleTagSelect = tag => {
    setActiveTag(tag.id);
    loadNews(tag.id);
  };

  return (
    <div>
      <Row gutter={24}>
        <Col xs={24} lg={6}>
          <Banner items={bannerNews} onSelect={persistAndNavigate} />
        </Col>
        <Col xs={24} lg={18}>
          <Row gutter={[16, 16]}>
            {topList.map(news => (
              <Col xs={12} lg={6} key={news.id}>
                <NewsCard news={news} onClick={persistAndNavigate} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      <TagLine items={tags} activeId={activeTag} onSelect={handleTagSelect} />

      {newsList.length === 0 ? (
        <Empty description="no news" />
      ) : (
        <Row gutter={[16, 16]}>
          {newsList.map(news => (
            <Col xs={24} sm={12} lg={6} key={news.id}>
              <NewsCard news={news} onClick={persistAndNavigate} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default NewsFeed;
