// **** State ****
const state = {
  searchTypeOptions: ['customSearch', 'nowPlaying', 'topRated', 'upcoming'],
  searchType: 'nowPlaying',
  customSearch: {
    URL: 'https://api.themoviedb.org/3/search/movie',
    query: {
      api_key:'9084eae9f770e006ebcba95dbd474e28',
      query: '',
      page: 1
    }
  },
  nowPlaying: {
    URL: 'https://api.themoviedb.org/3/movie/now_playing',
    query: {
      api_key:'9084eae9f770e006ebcba95dbd474e28',
      language: 'en',
      region: 'us',
      page: 1
    }
  },
  topRated: {
    URL: 'https://api.themoviedb.org/3/movie/top_rated',
    query: {
      api_key:'9084eae9f770e006ebcba95dbd474e28',
      language: 'en',
      region: 'us',
      page: 1
    }
  },
  upcoming: {
    URL: 'https://api.themoviedb.org/3/movie/upcoming',
    query: {
      api_key:'9084eae9f770e006ebcba95dbd474e28',
      language: 'en',
      region: 'us',
      page: 1
    }
  },
  tempResults: {},
  searchTitle: 'Now Playing in Theatres',
  page: 1,
  pagesAvailable: 1,
  currentResultSelected: 0,
  currentDate: function() {
    let date = new Date();
    let isoDate = date.toISOString().slice(0,10);
    return isoDate;
  }
}


// **** State modification functions ****
function updateSearchType(string) {
  console.log('string', string);
  state.searchType = string;
}

function updateSearchTitle(title) {
  state.customSearch.query.query = title;
  state.searchTitle = title;
}

function updateCurrentResultSelected(num) {
  state.currentResultSelected = num;
}

function setTempResults(data) {
  state.tempResults = data;
}

function resetPage() {
  state.page = 1;
  console.log('state.page', state.page);
  return state;
}

function prevPage() {
  if (state.page > 1) {
    state.page--;
    getDataFromApi(state, displayMDBSearchData, state.searchType)
  }
}

function nextPage() {
  if (state.page < state.pagesAvailable) {
    state.page++;
    getDataFromApi(state, displayMDBSearchData, state.searchType)
  }
}

function goToPage(num) {
  console.log('num', num);
  state.page = num;
  getDataFromApi(state, displayMDBSearchData, state.searchType);
}

// **** AJAX Functions ****
function getDataFromApi(state, callback, options) {
    let page = state.page;
    let searchOption = state.searchType;
    state[searchOption].query.page = page;
    let URL = state[searchOption].URL;
    let query = state[searchOption].query;

    $.getJSON(URL, query, callback);  
}

// **** Render function ****
function displayMDBSearchData(data) {
  let resultElement = '<div class="row">';
  let paginateOptions = '';
  let resultsIndex = 0;
  let heading = state.searchTitle;
  let maxPaginationPage = 10;
 
  if (data.results) {
    setTempResults(data);
    console.log(state.tempResults);
    state.pagesAvailable = Math.ceil(data.total_results / 20);
    data.results.forEach(function(item) {
      resultElement += 
      '<div class="col-xs-6 col-md-3 card"><div class="thumbnail"><img src="https://image.tmdb.org/t/p/w500' + item.poster_path + '" alt="' + item.title + '"><span class="badge vote">' + item.vote_average + '</span><div class="clickHere" onclick="updateCurrentResultSelected(' + resultsIndex + ')" data-toggle="modal" data-target="#exampleModal"><h3>Click for more information</h3><span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span></div></div></div>';

      resultsIndex++;
    });

    resultElement += '</div>';

    paginateOptions = '<div>Results per page: 20</div><nav aria-label="Page navigation"><ul class="pagination"><li onclick="prevPage()"><a href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';

    if (state.pagesAvailable < 10) {
      maxPaginationPage = state.pagesAvailable;
    }

    for (let i = 1; i < maxPaginationPage; i++) {
      paginateOptions += '<li onclick="goToPage('+ i +')"><a href="#">' + i + '</a></li>'
    }
 
    paginateOptions += '<li onclick="nextPage()"><a href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li></ul></nav>';
    }

  else {
    resultElement += '<p>No results</p>';
  }

  
  $('#searchTitle').html('<h1>Search Results: ' + heading + '</h1>')
  $('.js-default-results').html(resultElement);
  $('.paginate').html(paginateOptions);

}

function launchModal(num) {
  console.log('index position in results array is: ', num);
  console.log('tempResults at index ', num, ' is: ', state.tempResults.results[num]);
}

// Modal launch
$('#exampleModal').on('show.bs.modal', function (event) {
  let num = state.currentResultSelected;
  let movie = state.tempResults.results[num];
  // Will investigate to see if there is method similiar to line 210 that works
  // var button = $(event.relatedTarget.dataset['data-index']); // Button that triggered the modal
  let modal = $(this);
  modal.find('.modalImage').attr('src', 'https://image.tmdb.org/t/p/w500' + movie.poster_path)
  modal.find('.modalTitle').text(movie.title);
  modal.find('.modalReleaseDate').html('<strong>Release Date: </strong>' + movie.release_date);
  modal.find('.modalTotalVotes').html('<strong>Total votes: </strong>' + movie.vote_count)
  modal.find('.modalVoteRating').html('<strong>Average Rating: </strong>' + movie.vote_average);
  modal.find('.modalOverview').html('<strong>Overview: </strong>' + movie.overview);
})


// **** Event Listeners ****

// On Page Load
document.onload = getDataFromApi(state, displayMDBSearchData);
$(function(){watchSubmit();});

// Submitting custom search
function watchSubmit() {
  $('#searchForm').submit(function(e) {
    e.preventDefault();
    let title = $(this).find('#searchFormInput').val();
    updateSearchTitle(title);
    resetPage();
    updateSearchType('customSearch')
    getDataFromApi(state, displayMDBSearchData, true);
  });
}
// Concerning Custom Search bar
$('#searchButton').on('click', function(event) {
  event.preventDefault();
  $('#searchButton,#searchForm').toggleClass('hidden');
});

$(document).on('blur','#searchFormInput', function() {
    $('#searchButton,#searchForm').toggleClass('hidden');
});

// Concerning Popular Searches
$('#whatsPlayingNow').on('click', function() {
  resetPage();
  updateSearchType('nowPlaying');
  updateSearchTitle('Now Playing in Theatres');
  getDataFromApi(state, displayMDBSearchData);
});

$('#topRated').on('click', function() {
  resetPage();
  updateSearchType('topRated');
  updateSearchTitle('Top Rated');
  getDataFromApi(state, displayMDBSearchData);
});

$('#upcoming').on('click', function() {
  resetPage();
  updateSearchType('upcoming');
  updateSearchTitle('Upcoming');
  getDataFromApi(state, displayMDBSearchData);
});

