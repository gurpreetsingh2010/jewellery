<#import "/spring.ftl" as spring />
<#import "macro.ftl" as macro/>

<@macro.showHeader />
<div class="inner-col" id ="mainDiv">
	<div>
        <h3>Add Purchase</h3>
    </div>
	<div class="row-fluid">
		<form class="form-horizontal">
			<div class="span6">
				<table class="table">
					<tr>
						<td class="td-25"><span class="btn btn-link">Supplier Name</span></td>
						<td>
							<select name="supplierName" class="input-medium">
								<option value="0">Select Supplier</option> 
							</select>
						</td>
					</tr>
					<tr>
						<td class="td-25"><span class="btn btn-link">Supplier Code</span></td>
						<td><input type="text" class="input-medium" name="supplierCode"></td>
					</tr>
					<tr>
						<td class="td-25"><span class="btn btn-link">Warehouse</span></td>
						<td>
							<select name="warehouse" class="input-medium">
								<option value="0">Select Warehouse</option> 
							</select>
						</td>
					</tr>
					<tr>
						<td class="td-25"><span class="btn btn-link">Order Date</span></td>
						<td><input type="text" class="input-medium" name="orderDate"></td>
					</tr>
					<tr>
						<td class="td-25"><span class="btn btn-link">Delivery Date</span></td>
						<td><input type="text" class="input-medium" name="deliveryDate"></td>
					</tr>
				</table>
			</div>
			
			<div class="span6">
				<table class="table">
					<tr>
						<td class="td-25"><label>Street</lable></td>
						<td><input type="text" class="input-medium" name="street"></td>
					</tr>
					<tr>
						<td class="td-25"><label>City</lable></td>
						<td><input type="text" class="input-medium" name="city"></td>
					</tr>
					<tr>
						<td class="td-25"><label>State/Region</lable></td>
						<td><input type="text" class="input-medium" name="state"></td>
					</tr>
					<tr>
						<td class="td-25"><label>Pin</label></td>
						<td><input type="text" class="input-medium" name="pin"></td>
					</tr>
					<tr>
						<td class="td-25"><label>Country</label></td>
						<td><input type="text" class="input-medium" name="country"></td>
					</tr>
				</table>
			</div>
		</form>	
	</div>
	<div class="row-fluid">
		<form class="form-inline">
			<div class="span3">
				<span class="btn btn-link">Product Group</span>
				<select name="productGrp">
					<option value="0">Select Group</option>
				</select>
			</div>
			<div class="span3">
				<span class="btn btn-link">Product</span>
				<select name="productGrp">
					<option value="0">Select Product</option>
				</select>
			</div>
			<div class="span2">
				<label>Quantity</label>
				<input type="text" class="input-small" name="quantity">
			</div>
			<div class="span2">
				<label>Price</label>
				<input type="text" class="input-small" name="price">
			</div>
			<div class="span2">
				<label>Availability</label>
				<input type="text" class="input-small" name="availability">
			</div>
			<div class="span2">
				<label>Sub Total</label>
				<input type="text" class="input-small" name="subTotal">
			</div>
			<div class="span2">
				<label>Comment</label>
				<input type="text" class="input-large" name="comment">
			</div>	
		</form>
	</div>
</div>
<@macro.showFooter>
	<script type="text/javascript" src="${rc.getContextPath()}/resources/js/pages/addPurchase.js"></script>
	<script>
		$(function(){
			new defysope.addpurchase.Main("#mainDiv", {
			});
		});
	</script>
</@macro.showFooter>