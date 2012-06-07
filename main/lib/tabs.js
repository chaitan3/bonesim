
showTab = function(id) {
		// hide all other tabs
		for (index in tabDivs) {
			hide( tabDivs[index].id );
			}

		// show tab
		show( id+'_tab' );

		// un-highlight all other tabselectors
		for (index in tabSelectors) {
			var ts = document.getElementById(tabSelectors[index].id);
			ts.style['background-color'] = 'white';
//			ts.style['color'] = 'yellow';
			}

		// highlight corresponding tabselector
		var ts = document.getElementById(id);
		ts.style['background-color'] = 'blue';
//		ts.style['color'] = 'white';
		}

onTabSelectorClick = function(event) {
			showTab(event.srcElement.id);
			}

tabSelectors = Array.prototype.slice.call(document.getElementsByClassName('tabselector'), 0);

for (index in tabSelectors) {
	tabSelectors[index].onclick = onTabSelectorClick;
	}

tabDivs = Array.prototype.slice.call(document.getElementsByClassName('tab'), 0);

