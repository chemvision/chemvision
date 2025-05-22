/**
 * MolVision Leaderboard
 * A module for rendering a sortable leaderboard table from JSON data
 */

class LeaderboardRenderer {
  /**
   * Constructor for the LeaderboardRenderer
   * @param {Object} config - Configuration object
   * @param {string} config.tableId - ID of the table element
   * @param {string} config.headId - ID of the thead element
   * @param {string} config.bodyId - ID of the tbody element
   * @param {string} config.titleId - ID of the title element
   * @param {string} config.dataUrl - URL of the JSON data file
   */
  constructor(config) {
    this.tableId = config.tableId;
    this.headId = config.headId;
    this.bodyId = config.bodyId;
    this.titleId = config.titleId;
    this.dataUrl = config.dataUrl;
    
    this.data = null;
    this.sortConfig = {
      key: 'average',
      direction: 'desc'
    };
    
    // Bind methods to this instance
    this.handleSort = this.handleSort.bind(this);
    this.loadData = this.loadData.bind(this);
    this.renderTable = this.renderTable.bind(this);
  }
  
  /**
   * Load data from JSON file
   * @returns {Promise} Promise resolving when data is loaded
   */
  async loadData() {
    try {
      const response = await fetch(this.dataUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
      }
      
      this.data = await response.json();
      return this.data;
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      document.getElementById(this.titleId).textContent = 'Error loading leaderboard data';
      throw error;
    }
  }
  
  /**
   * Handle sorting when a column header is clicked
   * @param {string} key - The column key to sort by
   */
  handleSort(key) {
    let direction = 'asc';
    if (this.sortConfig.key === key && this.sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    this.sortConfig = { key, direction };
    this.renderTable();
  }
  
  /**
   * Create and return a table header row
   * @returns {HTMLTableRowElement} The header row element
   */
  createHeaderRow() {
    const headerRow = document.createElement('tr');
    
    this.data.columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column.label;
      
      if (column.sortable) {
        th.classList.add('sortable');
        th.addEventListener('click', () => this.handleSort(column.id));
        
        if (this.sortConfig.key === column.id) {
          th.className += this.sortConfig.direction === 'asc' ? ' sorted-asc' : ' sorted-desc';
        }
      }
      
      if (column.emphasized) {
        th.classList.add('average-column');
      }
      
      headerRow.appendChild(th);
    });
    
    return headerRow;
  }
  
  /**
   * Sort the data rows according to current sort configuration
   * @returns {Array} Sorted array of data rows
   */
  getSortedRows() {
    return [...this.data.rows].sort((a, b) => {
      if (a[this.sortConfig.key] < b[this.sortConfig.key]) {
        return this.sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[this.sortConfig.key] > b[this.sortConfig.key]) {
        return this.sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  
  /**
   * Create table body with data rows
   * @param {Array} sortedRows - Array of sorted data rows
   * @returns {DocumentFragment} Fragment containing all table rows
   */
  createTableBody(sortedRows) {
    const fragment = document.createDocumentFragment();
    
    sortedRows.forEach(row => {
      const tr = document.createElement('tr');
      
      this.data.columns.forEach(column => {
        const td = document.createElement('td');
        td.textContent = row[column.id];
        
        if (column.id === 'method') {
          td.classList.add('method-column');
        }
        
        if (column.id === 'average') {
          td.classList.add('average-column');
        }
        
        tr.appendChild(td);
      });
      
      fragment.appendChild(tr);
    });
    
    return fragment;
  }
  
  /**
   * Render the complete table
   */
  renderTable() {
    if (!this.data) {
      console.error('No data available to render table');
      return;
    }
    
    // Set the table title
    const titleElement = document.getElementById(this.titleId);
    if (titleElement) {
      titleElement.textContent = this.data.title;
    }
    
    // Create and populate table header
    const tableHead = document.getElementById(this.headId);
    if (tableHead) {
      tableHead.innerHTML = '';
      tableHead.appendChild(this.createHeaderRow());
    }
    
    // Get sorted rows
    const sortedRows = this.getSortedRows();
    
    // Create and populate table body
    const tableBody = document.getElementById(this.bodyId);
    if (tableBody) {
      tableBody.innerHTML = '';
      tableBody.appendChild(this.createTableBody(sortedRows));
    }
  }
  
  /**
   * Initialize the leaderboard
   * @returns {Promise} Promise resolving when initialization is complete
   */
  async init() {
    try {
      await this.loadData();
      this.renderTable();
      return true;
    } catch (error) {
      console.error('Failed to initialize leaderboard:', error);
      return false;
    }
  }
}

// Initialize the leaderboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const leaderboard = new LeaderboardRenderer({
    tableId: 'leaderboard',
    headId: 'table-head',
    bodyId: 'table-body',
    titleId: 'table-title',
    dataUrl: 'static/json/leaderboard-data.json'
  });
  
  try {
    await leaderboard.init();
    console.log('Leaderboard initialized successfully');
  } catch (error) {
    console.error('Leaderboard initialization failed:', error);
  }
});