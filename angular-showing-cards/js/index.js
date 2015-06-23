(function(){
	var home = angular.module( 'csCardDemo.home', []);

	home.controller( 'HomeController', function ($scope, $rootScope, $http, $q, CONFIG)
	{
		var self = this;

		// Define some basic shared model data for the entire application.
		$scope.model = {
			selectedStreamId: CONFIG.streamId,
			cards: [],
			streamDirection: "past",
			numberOfCards: 20,
      endOfStream: false,
      loadingMoreCards: false,
      currentQuery: ""
		};

		// Set some initial params for the SDK to connect to the AP
		this.app_id = CONFIG.app_id;
		this.app_key = CONFIG.app_key;
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

			var deferred = $q.defer();
			CS.api("/streams/" + streamId + params, "GET", function (response) {
				$rootScope.$apply(function()
				{
					if(angular.isUndefined(response.error))
					{
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
			self.getCards(streamId, cardCount.toString(), direction, timestamp, $scope.model.currentQuery).then(function (data)
			{
				console.log(data.cards);

				// If we get 0 cards back, we probably don't have anymore cards to load.
				if(data.cards.length == 0)
				{
					$scope.model.endOfStream = true;
				}

				// If we are loading more cards, we need to copy the results to the end of the cards array
				if($scope.model.loadingMoreCards)
				{
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

      $scope.model.loadingMoreCards = true;
      $scope.getCards($scope.model.selectedStreamId, $scope.model.numberOfCards, $scope.model.streamDirection, lastCard.displayAt);
    };

		this.init();
	});

})();