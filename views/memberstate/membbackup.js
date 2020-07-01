<style>
.uk-card.uk-card-body {
    width: 350px;
    height: 400px;
    margin-top: 296px;
}
</style>
<%- include("../submenu/submenu") -%>
<h2> Production Data for <%= memberState.countryName %> </h2>

	
<!--
<form>
	<div class="uk-child-width-1-2@s" uk-grid>
	    <div>
		<ul class="uk-tab-left" uk-tab>
		    <li class="#"><a href="#">Cattle</a></li>
		    <li><a href="#">Goats</a></li>
		    <li><a href="#">Chicken</a></li>
		</ul>
	    </div>

	    <div>
		<ul class="uk-tab-right" uk-tab>
		    <li class="#"><a href="#">2019</a></li>
		    <li><a href="#">2018</a></li>
		    <li><a href="#">2017</a></li>
		</ul>
	    </div>
	</div>
</form>
-->

<!-- <form class="uk-grid-small" uk-grid action="/production/<%=`${memberState._id}`%>/analytics" method="post"> -->
 <form class="uk-grid-small" id="chart-form" uk-grid> 
	<div class="uk-width-1-2@s">
		<select class="uk-select" id="livestock" name="livestock" placeholder="Select Livestock" multiple required>

		 	<% liveStockProductionData.forEach(liveStock => { %>
				<option value= "<%= `${liveStock.name}` %>" > <%= liveStock.name %></option>


			<% }) %>


		<!-- <option value="cattles">cattles</option>
		  <option value="goats">goats</option>
		  <option value="rabbits"> Rabbit</option>
		  <option value="chicken"> Chicken</option>
		-->

		</select>
	</div>
	<div class="uk-width-1-2@s">
		<select class="uk-select" id="year" name="year" placeholder="Select Year" multiple required>
		  <option value="2010">2010</option>
		  <option value="2011">2011</option>
		  <option value="2012">2012</option>
		  <option value="2013">2013</option>
		  <option value="2014">2014</option>
		  <option value="2015">2015</option>
		  <option value="2016">2016</option>
		</select>
	</div>
 <button type="submit">Generate</button> 
<!--	<input type="submit" name="submit"> -->
</form> 

<!-- <h4> Livestock Production Information </h4> -->
<h3> Cattle Production Quantity per tonne </h3>
<ul class="uk-subnav uk-subnav-pill" uk-switcher>
    <li><a href="#">Table Format</a></li>
    <li><a href="#">Visualization</a></li>
</ul>

<ul class="uk-switcher uk-margin">
    <li>

	<table id="tableData" class="uk-table myData uk-table-striped">
	    <thead>
		<tr>
		    <th>Livestock Name</th>
		    <th>Quantity (tonnes)</th>
		    <th>Year</th>
		</tr>
	    </thead>
	    <tbody>
	    </tbody>
	<!-- 
	 <tfoot>
            <tr>
                <th>Country Name</th>
                <th>Population</th>
                <th>Population</th>
	   </tr>
        </tfoot>
	-->
</table>

    </li>
    <li>

    	<div id="chart" style="max-width:750px;margin: 25px;"></div>


    </li>
</ul>

<div>

<!-- Test Data, comment out
<ul>
	<% liveStockProductionData.forEach(liveStock => { %>
		<li> <%= liveStock.name %> : <%= liveStock.year %></li>


	<% }) %>
-->
</ul>
</div>

<script>
/*
	$(document).ready(function() {
	    $('.myData').DataTable({
		dom: 'Bfrtip',
		buttons: [
		    'excelHtml5',
		    'csvHtml5',
		    'pdfHtml5'
		]
	    });
	})

*/
	let live = []

	let livestocks = []
	let year = []
	$("#livestock").change(function() {

		livestocks.push($(this).val())
	})
	$("#year").change(function() {

		year.push($(this).val())
	})
	let table = $("#tableData tbody")
	let xCoor = []
	let yCoor = []
	let name = []
	let myChart = new Object()
	let datArr = []

	var options = {
			  chart: {
			      height: 350,
			      type: 'bar'
			  },
			  plotOptions: {
				  bar: {
				    horizontal: false,
				    columnWidth: '100%',
				  },
			  dataLabels: {
			      enabled: true
			  },
			 },
			 tooltip: {
				x: {
					show: true
				}
			 },
			 legend: {
				show: true,
				showForNullSeries: true,
				showForZeroSeries: true
			 },
			series:[],
			xaxis: {
				//categories: xCoor,
				type: 'category',
				tickPlacement: 'on',
				labels: {
					showDuplicates: false
				}
			},
/*
			xaxis: {
				categories: xCoor
			},

*/
			  title: {
			      text: 'Livestock Production',
			  },
			  noData: {
			    text: 'No Data...'
			  },
/*
 
	xaxis: {
          type: 'category',
          tickPlacement: 'on',
          labels: {
            rotate: -45,
            rotateAlways: true
          }
        }
*/


			}
	var chart = new ApexCharts(
			  document.querySelector("#chart"),
			  options
			)

	chart.render()
	if (name.length == 0) {
		//table.append("<tr> <td> No Data </td> <td> No Data </td> <td> No Data </td> </tr>")

	}
/* 
	    $('#tableData').DataTable({
		dom: 'Bfrtip',
		buttons: [
		    'excelHtml5',
		    'csvHtml5',
		    'pdfHtml5'
		]
	    })

*/
	document.body.addEventListener("submit", async function(event) {
	  
	
		//$("#tableData").remove();

		event.preventDefault()
		xCoor.length = 0
		yCoor.length = 0
		name.length = 0
		datArr.length = 0
		const form = event.target
		for (var prop in myChart) { if (myChart.hasOwnProperty(prop)) { delete myChart[prop]; } }
		const result = await fetch("/production/<%=memberState._id%>/analytics", {

			method: "POST",
			body: new URLSearchParams([...(new FormData(form))])
		})
	        .then((response) => response.json())
		.then(result => {
		

			result.data.forEach(ch => {
				xCoor.push(Number(ch.year))
				yCoor.push(Number(ch.quantity))
				name.push(ch.name)
		
				//$.each(ch, (idx, ele) => {
					console.log(ch)
					table.append("<tr><td>"+ch.name+"</td><td>"+ch.quantity+"</td>   <td>"+ch.year+"</td></tr>")
	

				//})
				for (let i=0; i<result.data.length; i++) {
				    console.log('count')
				    datArr[i] = {
					name: name[i],
					data: [{x: xCoor[i], y: yCoor[i]}]
				    };
				}
			})

				
		
		   chart.updateSeries([{
                   	name: "l",
			data: []
                   }])

		 

		   const xC = [... new Set(xCoor)]
		   //console.log(xC)
		  // console.log(xCoor)
		})
		.then(() => {
		
		//console.log(name.length)
		chart.updateSeries(datArr)



/*	
		for(let i = 0; i < name.length; i++) {
			console.log( [{x: xCoor[i], y: yCoor[i]}])
		    chart.appendSeries({
			name: name[i],
			data: [{x: xCoor[i], y: yCoor[i]}]
			//data: [yCoor[i]]
		    })
		}


*/

/*	

		for(let i = 0; i < name.length; i++) {
		    chart.updateSeries([{
			name: name[i],
			data: [{x: xCoor[i], y: yCoor[i]}]
		    }])
		}

		


		let url = 'http://my-json-server.typicode.com/apexcharts/apexcharts.js/yearly';

		
		$.getJSON(url, function(response) {
		  chart.updateSeries([{
			    name: name,
			    data: response
		  }])
		});
		
*/		
		})
		.catch(error => console.log(error)) 
	})
	
</script>








