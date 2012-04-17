
showTab = function(id) {
		// hide all other tabs
		for (index in tabDivs) {
			hide( tabDivs[index].id );
			}

		// show tab
		show( id+'_tab' );

		// un-highlight all other tabselectors
		for (index in tabSelectors) {
			ts = document.getElementById(tabSelectors[index].id);
			ts.style['background-color'] = '#DDD';
			ts.style['color'] = 'black';
			}

		// highlight corresponding tabselector
		ts = document.getElementById(id);
		ts.style['background-color'] = 'blue';
		ts.style['color'] = 'white';
		}

onTabSelectorClick = function(event) {
			showTab(event.srcElement.id);
			}

tabSelectors = Array.prototype.slice.call(document.getElementsByClassName('tabselector'), 0);

for (index in tabSelectors) {
	tabSelectors[index].onclick = onTabSelectorClick;
	}

tabDivs = Array.prototype.slice.call(document.getElementsByClassName('tab'), 0);

