import { useEffect, useState } from 'react';
import { Col, Empty, Input, Row } from 'antd';
import { useNavigate } from 'react-router-dom';
import client from '@/api/client.js';
import NewsCard from '@/components/NewsCard.jsx';

const Search = () => {
  const [keyword, setKeyword] = useState(() => sessionStorage.getItem('keyWord') || '');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (keyword) {
      fetchData(keyword);
    }
  }, []);

  const fetchData = async value => {
    const { data } = await client.post('/news/query', { name: value });
    if (data.code === 200) {
      setResults(data.data);
    }
  };

  const handleSearch = value => {
    setKeyword(value);
    sessionStorage.setItem('keyWord', value);
    fetchData(value);
  };

  const handleClick = news => {
    sessionStorage.setItem('newsInfo', JSON.stringify(news));
    navigate('/user/news-detail');
  };

  return (
    <div>
      <Input.Search
        placeholder="search news"
        enterButton
        allowClear
        defaultValue={keyword}
        onSearch={handleSearch}
        style={{ marginBottom: 24, maxWidth: 420 }}
      />
      {results.length === 0 ? (
        <Empty description="no related news" />
      ) : (
        <Row gutter={[16, 16]}>
          {results.map(item => (
            <Col xs={24} sm={12} lg={6} key={item.id}>
              <NewsCard news={item} onClick={() => handleClick(item)} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Search;
