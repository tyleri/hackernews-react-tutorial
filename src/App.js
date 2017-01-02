import React, { Component } from 'react';
import './App.css';

const DEFAULT_QUERY = "redux";
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = 100;

const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";
const PARAM_HPP = "hitsPerPage=";

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      results: null,
      query: DEFAULT_QUERY,
      searchKey: "",
      isLoading: false
    };
  }

  setSearchTopstories = result => {
    const { hits, page } = result;
    const { searchKey } = this.state;
    const oldHits = page === 0 ? [] : this.state.results[searchKey].hits;
    const updatedHits = [ ...oldHits, ...hits ];
    this.setState({
      results: {...this.state.results, [searchKey]: {hits: updatedHits, page}},
      isLoading: false
    });
  }

  fetchSearchTopstories = (query, page) => {
    this.setState({ isLoading: true });
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${query}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopstories(result));
  }

  onSearchChange = event => this.setState({ query: event.target.value });

  onSearchSubmit = event => {
    this.setState({ searchKey: this.state.query });
    if (this.needsToSearchTopstories(this.state.query)) {
      this.fetchSearchTopstories(this.state.query, DEFAULT_PAGE);
    }
    event.preventDefault();
  }

  needsToSearchTopstories = (query) => !this.state.results[query];

  componentDidMount = () => {
    this.setState({ searchKey: this.state.query });
    this.fetchSearchTopstories(this.state.query, DEFAULT_PAGE);
  }

  render() {
    const { query, results, searchKey, isLoading } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    return (
      <div className="page">
        <div className="interactions">
          <Search value={query}
                  onChange={this.onSearchChange}
                  onSubmit={this.onSearchSubmit}>
            Search
          </Search>
        </div>
        <Table list={list} />
        <div className="interactions">
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}>
            More
          </ButtonWithLoading>
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
  </div>;

const Button = ({ onClick, children }) =>
  <button onClick={onClick} type="button">
    {children}
  </button>;

const Loading = () => <div>Loading ...</div>;

const withLoading = (Component) => ({ isLoading, ...props }) =>
  isLoading ? <Loading /> : <Component {...props} />;

const ButtonWithLoading = withLoading(Button);

export default App;

export {
  Button,
  Search,
  Table
};
