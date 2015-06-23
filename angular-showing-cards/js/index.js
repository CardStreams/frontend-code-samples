(function(){
	var home = angular.module( 'csCardDemo.home', []);

	home.controller( 'HomeController', function ($scope, $rootScope, $http, $q)
	{
		var self = this;

		// Define some basic shared model data for the entire application.
		$scope.model = {
			selectedStreamId: "000",
			cards: [],
			streamDirection: "past",
			numberOfCards: 20,
      endOfStream: false,
      loadingMoreCards: false,
      currentQuery: ""
		};

		// Set some initial params for the SDK to connect to the API
		// Your appId and appKey from CardStreams
		this.app_id = "000";
		this.app_key = "000";
		this.api_url = "https://api.cardstreams.io/v1";

		this.init = function()
		{
			CS.init({
				'app_id': this.app_id,
				'app_key': this.app_key,
				"api_url": this.api_url
			});

			$scope.getCards($scope.model.selectedStreamId, $scope.model.numberOfCards, $scope.model.streamDirection)
		};

		this.getCards = function (streamId, count, direction, timestamp, query)
		{

			//url: "/streams/{id}/cards?ts={?ts}&limit={?limit}&direction={?direction}&media_urls={?media_urls}&preview_urls={?preview_urls}&thumb_urls={?thumb_urls}&urls_ttl={?urls_ttl}",
			//var params = "/cards?ts=1417566946&direction=after&limit=14";
			var params;

			if(timestamp)
			{
				params = "/cards?ts=" + timestamp;
			}
			else
			{
				params = "/cards?ts=" + Date.now();
			}

			if(count)
			{
				params += "&limit=" + count;
			}

			if(direction)
			{
				params += "&direction=" + direction;
			}

			if(query)
			{
				params += "&q=" + query;
			}

			//params += "&q=tag:city-Annapolis%20AND%20tag:category-Baby%20Bump";
			//params += "&q=tag:city-Annapolis";
			//params += "&q=tags:category-Gifts AND";
			//params += "&q=tags:city-Annapolis AND tags:category-Food";
			//params += "&q=tags:'category-Learn%20%26%20Play'";

			console.log("streamId: " + streamId);

			var deferred = $q.defer();
			CS.api("/streams/" + streamId + params, "GET", function (response) {
				$rootScope.$apply(function()
				{
					if(angular.isUndefined(response.error))
					{
						//console.log("GET CARDS RESPONSE");
						console.log(response);
						deferred.resolve(response);
					}
					else
					{
						deferred.reject(response.error)
					}
				});
			});

			return deferred.promise;
		};

		$scope.getCards = function(streamId, cardCount, direction, timestamp)
		{
			console.log("getCards()");
			self.getCards(streamId, cardCount.toString(), direction, timestamp, $scope.model.currentQuery).then(function (data)
			{
				console.log(data.cards);

				// If we get 0 cards back, we probably don't have anymore cards to load.
				if(data.cards.length == 0)
				{
					console.log("marking end of stream");
					$scope.model.endOfStream = true;
				}

				// If we are loading more cards, we need to copy the results to the end of the cards array
				if($scope.model.loadingMoreCards)
				{
					console.log("We just loaded more cards");
					var copiedCards = angular.copy(data.cards);
					var len = copiedCards.length;

					for(var i = 0; i < len; i++)
					{
						$scope.model.cards.push(copiedCards[i]);
					}

					$scope.model.loadingMoreCards = false;
				}
				else
				{
					$scope.model.initialLoadOfCardsComplete = true;
					$scope.model.cards = data.cards;
				}

			}, function (error)
			{
				console.log('error', error);
			});
		};

    $scope.loadMoreCards = function()
    {
			var len = $scope.model.cards.length;
      if(len == 0)
        return;

      var lastCard = $scope.model.cards[len - 1];
      if(lastCard == null)
        return;

			console.log("calling get more cards");

      $scope.model.loadingMoreCards = true;
      $scope.getCards($scope.model.selectedStreamId, $scope.model.numberOfCards, $scope.model.streamDirection, lastCard.displayAt);
    };

		// initialize the application with default ID, Key and URL, then load some cards up
		this.init();
	});

	home.directive('homeModule', function () {
		return {
			templateUrl: './view/home.tpl.html'
		};
	});

})();