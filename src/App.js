import React, { Component } from 'react';
import './App.css';

const DEFAULT_QUERY = "redux";
const DEFAULT_PAGE = 0;
const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      result: null,
      query: DEFAULT_QUERY
    };
  }

  setSearchTopstories = result => {
    const { hits, page } = result;
    const oldHits = page === 0 ? [] : this.state.result.hits;
    const updatedHits = [ ...oldHits, ...hits ];
    this.setState({ result: {hits: updatedHits, page} });
  }

  fetchSearchTopstories = (query, page) =>
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${query}&${PARAM_PAGE}${page}`)
      .then(response => response.json())
      .then(result => this.setSearchTopstories(result));

  onSearchChange = event => this.setState({ query: event.target.value });

  onSearchSubmit = event => {
    this.fetchSearchTopstories(this.state.query, DEFAULT_PAGE);
    event.preventDefault();
  }

  componentDidMount = () =>
    this.fetchSearchTopstories(this.state.query, DEFAULT_PAGE)

  render() {
    const { query, result } = this.state;
    const page = (result && result.page) || 0;
    return (
      <div className="page">
        <div className="interactions">
          <Search value={query}
                  onChange={this.onSearchChange}
                  onSubmit={this.onSearchSubmit}>
            Search
          </Search>
        </div>
        { result && <Table list={result.hits} pattern={query} /> }
        <div className="interactions">
          <Button onClick={() => this.fetchSearchTopstories(query, page + 1)}>
            More
          </Button>
        </div>
      </div>
    );
  }
}

const Search = ({ value, onChange, onSubmit, children }) =>
  <form onSubmit={onSubmit}>
    <input type="text" value={value} onChange={onChange} />
    <button type="submit">{children}</button>
  </form>

const Table = ({ list }) =>
  <div className="table">
    { list.map( item =>
      <div key={item.objectID} className="table-row">
        <span style={{ width: '40%' }}><a href={item.url}>{item.title}</a></span>
        <span style={{ width: '30%' }}>{item.author}</span>
        <span style={{ width: '15%' }}>{item.num_comments}</span>
        <span style={{ width: '15%' }}>{item.points}</span>
      </div>
    ) }
  </div>

const Button = ({ onClick, children }) =>
  <button onClick={onClick} type="button">
    {children}
  </button>

export default App;
