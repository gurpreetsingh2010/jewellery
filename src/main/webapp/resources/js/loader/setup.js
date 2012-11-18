$(function() {
	$.Class('gts.attendance.asca.loader.setup.Main', {}, {
		init : function(el, options) {
			this.el = $(el);
			$.extend(this.options, options);
			this.btnPrev = $('.wizard-prev', this.el).on('click',
					this.proxy('_onWizardPrevClick'));
			this.btnNext = $('.wizard-next', this.el).on('click',
					this.proxy('_onWizardNextClick'));
			this.btnCancel = $('.wizard-cancel', this.el).on('click',
					this.proxy('_onWizardCancelClick'));
			this.btnFinish = $('.wizard-finish', this.el).on('click',
					this.proxy('_onWizardFinishClick'));

			this.elWizardStorageType = $('.wizard-panel.storage-type');

			this.elWizardFileDetails = $('.wizard-panel.storage-file-det');
			this.elWizardDbDetails = $('.wizard-panel.storage-db-det');

			this.elWizardFieldMappingCSV = $('.wizard-panel.fields-csv');
			this.elWizardFieldMappingDB = $('.wizard-panel.fields-db');

			this.btnWizardActions = $('.wizard-actions .wizard-btn', this.el);

			this.elFieldFormatModal = $('.field-format-settings', this.el);

			$.templates(this.options.tmpl.csvFieldMapping, $(
							'script.tmpl-csv-field-mapping', this.el)[0]);
			$.templates(this.options.tmpl.csvFieldMappingField, $(
							'script.tmpl-csv-field-mapping-field', this.el)[0]);
			$
					.templates(this.options.tmpl.fieldFormatDt, $(
									'script.tmpl-field-format-settings-dt',
									this.el)[0]);
			$.templates(this.options.tmpl.inOutFormatDt, $(
							'script.tmpl-field-inout-settings-dt', this.el)[0]);

			$('form', this.elWizardStorageType).validate({
						rules : {
							'fileType' : {
								required : true
							}
						}
					});
			$('form', this.elWizardFileDetails).validate({
						rules : {
							'examplefile' : {
								required : !this.options.config
							},
							'fileLocation' : {
								required : true
							},
							'fileDateFormat' : {
								required : true
							},
							'fileExtension' : {
								required : true
							}
						}
					});
			$('form', this.elWizardDbDetails).validate({
						rules : {
							'dbProvider' : {
								required : true
							},
							'dbHost' : {
								required : true
							},
							'dbPort' : {
								required : true
							},
							'dbName' : {
								required : true
							},
							'dbUserName' : {
								required : true
							},
							'dbPassword' : {
								required : true
							}
						}
					});

			if (this.options.config.fileType) {
				$(':input[name="fileType"]', this.elWizardStorageType).select2(
						{
							data : this.options.storageTypes,
							initSelection : $.proxy(
									function(element, callback) {
										var storageType = this.options.storageTypes;
										for (var i = 0; i < storageType.length; i++) {
											if (storageType[i].id == this.options.config.fileType) {
												callback({
															id : storageType[i].id,
															text : storageType[i].text
														});
											}

										}

									}, this)

						});
				$(':input[name="fileType"]', this.elWizardStorageType).select2(
						'val', this.options.config.fileType);
				$(':input[name="fileLocation"]')
						.val(this.options.config.fileLocation);
				if (this.options.config.fileType == 'jdbc') {
					var jdbcData = this.options.config;
					$(':input[name="dbHost"]', this.elWizardDbDetails)
							.val(jdbcData.dbHost)
					$(':input[name="dbPort"]', this.elWizardDbDetails)
							.val(jdbcData.dbPort)
					$(':input[name="dbName"]', this.elWizardDbDetails)
							.val(jdbcData.dbName)
					$(':input[name="dbUserName"]', this.elWizardDbDetails)
							.val(jdbcData.dbUserName)
					$(':input[name="dbPassword"]', this.elWizardDbDetails)
							.val(jdbcData.dbPassword)
					$(':input[name="dbSchemaName"]', this.elWizardDbDetails)
							.val(jdbcData.dbSchemaName)
				}

			} else {
				$(':input[name="fileType"]', this.elWizardStorageType).select2(
						{
							data : this.options.storageTypes
						});

				$(':input[name="fileDateFormat"]', this.elWizardFileDetails)
						.select2({
							createSearchChoice : this._customSelect2OptsCreator,
							data : this.options.fileDateFormats
						});
			}
			$(':input[name="dbProvider"]', this.elWizardDbDetails).select2({
						data : this.options.dbTypes
					});
			$(':input[name="dbSwipeTable"]', this.elWizardDbDetails).select2({
						createSearchChoice : this._customSelect2OptsCreator,
						data : this.options.dbTableList

					});

			$(':input[name="example-file"]', this.elWizardFileDetails).on(
					'change', this.proxy('_onExapleFileChange'));
			$(':input[name="dbProvider"]', this.elWizardDbDetails).on('change',
					this.proxy('_onDbTypeChange'));
			$('span.test-connection', this.elWizardDbDetails).on('click',
					this.proxy('_doTestConnection'))

			this.el.on('click', 'span.field-settings .btn', this
							.proxy('_onFieldSettingsClick'));

			this._setActiveTab(this.elWizardStorageType);

			this.config = {};
			if (this.options.config) {
				this.config = this.options.config
			}
		},

		_onWizardPrevClick : function() {
			var currentPanel = this.getActivePanel();

			if (currentPanel.is(this.elWizardFileDetails)) {
				this._setActiveTab(this.elWizardStorageType);
			} else if (currentPanel.is(this.elWizardDbDetails)) {
				this._setActiveTab(this.elWizardStorageType);
			} else if (currentPanel.is(this.elWizardFieldMappingDB)) {
				this._setActiveTab(this.elWizardDbDetails);
			} else if (currentPanel.is(this.elWizardFileDetails)) {
				this._setActiveTab(this.elWizardStorageType);
			} else if (currentPanel.is(this.elWizardFieldMappingCSV)) {
				this._setActiveTab(this.elWizardFileDetails);
			}
		},

		_onWizardNextClick : function() {
			var currentPanel = this.getActivePanel();
			var form = $('form', currentPanel);
			if (form.length == 1 && form.data('validator') && !form.valid()) {
				return;
			}

			var configKeys = currentPanel.data('configkeys');
			if (configKeys) {
				configKeys = configKeys.split(',');
				$.each(configKeys, $.proxy(function(i, v) {
									var key = v.trim();
									this.config[key] = $(
											':input[name="' + key + '"]', form)
											.val();
								}, this));
			}

			if (currentPanel.is(this.elWizardStorageType)) {
				this._onStorageTypeNext();
			} else if (currentPanel.is(this.elWizardFileDetails)) {
				this._onFileDetailsNext();
			} else if (currentPanel.is(this.elWizardDbDetails)) {
				this._doTestConnection()
			}
		},

		_onWizardCancelClick : function() {
			console.log('cancel');
		},

		_onWizardFinishClick : function() {
			var currentPanel = this.getActivePanel();
			var form = $('form', currentPanel);
			var mapping = [];
			if (form.length == 1 && form.data('validator') && !form.valid()) {
				return;
			}
			var errorlog = {};
			var valid = true;
			var dateTimeExists = false;
			var selectedField = $(':input.column-field', form);
			selectedField.each(function(i, v) {
				var val = $(v).val()
				if (val == 'datetime') {
					dateTimeExists = true;
				}

				for (var j = 0; j < i; j++) {
					if (selectedField.eq(j).val() == val && val != 'ignore') {
						var element = selectedField.eq(j);
						valid = false;
						errorlog[$(v).attr('name')] = 'Duplicate entires are not allowed';
						return;
					}
				}
				if (val == 'date' || val == 'datetime' || val == 'time') {
					if ($(v).data().config === undefined) {
						valid = false;
						errorlog[$(v).attr('name')] = 'Please select the proper format';
						return;
					}
				}
				if (val == 'inout') {
					if ($(v).data().config === undefined) {
						valid = false;
						errorlog[$(v).attr('name')] = 'Please select the proper IN and OUT indicator';
						return;
					}
				}
				if (dateTimeExists) {
					selectedField.each(function(i, v) {
						var val = $(v).val()
						if (val == 'date' || val == 'time') {
							valid = false;
							errorlog[$(v).attr('name')] = 'Please select other than Date and Time since Date time is already present.';
							return;
						}
					})

				}
				if (val == 'date' || val == 'datetime' || val == 'time') {
					var obj = {};
					obj['destination'] = val;
					obj['format'] = JSON.parse($(v).data().config).format;
					mapping.push(obj);
				} else if (val == 'inout') {
					var obj = {};
					obj['destination'] = val;
					obj['informat'] = JSON.parse($(v).data().config).inFormat;
					obj['outformat'] = JSON.parse($(v).data().config).outFormat;
					mapping.push(obj);
				} else {
					var obj = {};
					obj['destination'] = val;
					mapping.push(obj);
				}
			})

			this.config.mapping = mapping;
			console.dir(this.config);

			if (!valid) {
				form.data('validator').showErrors(errorlog);
			} else {

				$.ajax({
					url : GtsUtils.getContextPath()
							+ '/loader/setup/csv/csvmappingdata',
					data : {
						fileType : this.config.fileType,
						inputFileFormat : this.config.fileDateFormat,
						inputFileExtension : this.config.fileExtension,
						exampleFile : this.config.examplefile,
						mappingJson : JSON.stringify(this.config)
					},
					type : 'POST',
					msgprocessing : {
						hideMessage : true
					}
				}).done(function(data) {

						});

			}

			if (currentPanel.is(this.elWizardFieldMappingCSV)) {
				console.log('finish')
			}
		},

		_onExapleFileChange : function() {
			var fileName = $(':input[name="examplefile"]',
					this.elWizardFileDetails);
			$(':input[name="fileExtension"]', this.elWizardDbDetails)
					.val(fileName.val().split('.').pop());
		},
		_onDbTypeChange : function() {
			var dbName = $(':input[name="dbProvider"]', this.elWizardDbDetails)
					.val();
			$(':input[name="dbPort"]', this.elWizardDbDetails)
					.val(this.options.dbPorts[dbName].port);
		},

		_onFieldSettingsClick : function(e) {
			var $target = $(e.currentTarget);
			var currentPanel = this.getActivePanel();

			var $field = $target.parent().siblings('.column-field:input');
			var value = $field.val();
			if (value == 'date' || value == 'datetime' || value == 'time') {
				this._showDateFieldFormatter($field);
			} else if (value == 'inout') {
				this._showDateInOutFormatter($field);
			}
		},

		getActivePanel : function() {
			return $('.wizard-panel.active', this.el);
		},

		_setVisibility : function(el, visibility) {
			if (visibility) {
				el.show();
			} else {
				el.hide();
			}
		},

		_setActiveTab : function(panel) {
			this.getActivePanel().removeClass('active').hide();
			panel.addClass('active').show();
			var btns = panel.data('btns');
			this.btnWizardActions.hide();
			if (btns) {
				btns = btns.split(',');
				$.each(btns, $.proxy(function(i, v) {
							this.btnWizardActions.filter('.wizard-' + v).show();
						}, this));
			}
		},

		_customSelect2OptsCreator : function(term, data) {
			if ($(data).filter(function() {
						return this.text.localeCompare(term) === 0;
					}).length === 0) {
				return {
					id : term,
					text : term
				};
			}
		},

		_onStorageTypeNext : function() {
			if (this.config.fileType == 'csv') {
				this._setActiveTab(this.elWizardFileDetails);
				if (this.options.config) {
					$('input[name="fileExtension"]')
							.val(this.options.config.fileExtension)
					$(':input[name="fileDateFormat"]', this.elWizardFileDetails)
							.select2({

								data : this.options.fileDateFormats,
								initSelection : $.proxy(function(element,
										callback) {
									var fileDateFormats = this.options.fileDateFormats;
									for (var i = 0; i < fileDateFormats.length; i++) {
										if (fileDateFormats[i].id == this.options.config.fileDateFormat) {
											callback({
														id : fileDateFormats[i].id,
														text : fileDateFormats[i].text
													});
										}

									}

								}, this)
							}).select2('val',
									this.options.config.fileDateFormat);
				}

			} else if (this.config.fileType == 'jdbc') {
				$(':input[name="dbProvider"]', this.elWizardDbDetails).select2(
						{
							data : this.options.dbTypes,
							initSelection : $.proxy(
									function(element, callback) {
										var dbTypes = this.options.dbTypes;
										for (var i = 0; i < dbTypes.length; i++) {
											if (dbTypes[i].id == this.options.config.dbProvider) {
												callback({
															id : dbTypes[i].id,
															text : dbTypes[i].text
														});
											}

										}

									}, this)
						});
				$(':input[name="dbProvider"]', this.elWizardDbDetails).select2(
						'val', this.options.config.dbProvider);
				$(':input[name="dbSwipeTable"]', this.elWizardDbDetails)
						.select2({
							createSearchChoice : this._customSelect2OptsCreator,
							data : this.options.dbTableList,
							initSelection : $.proxy(
									function(element, callback) {

										callback({
											id : this.options.config.dbSwipeTable,
											text : this.options.config.dbSwipeTable

										});

									}, this)

						});
				$(':input[name="dbSwipeTable"]', this.elWizardDbDetails)
						.select2('val', this.options.config.dbSwipeTable);
				this._setActiveTab(this.elWizardDbDetails);
			} else {
				return false;
			}
		},
		_onFileDetailsNext : function() {
			var form = $('form', this.elWizardFileDetails);
			if (!this.options.config.mapping
					|| $("input[name='examplefile']").val() != '') {
				form.ajaxSubmit({
							url : GtsUtils.getContextPath()
									+ '/loader/setup/csv/file',
							dataType : 'json',
							type : 'POST',
							data : GtsUtils.getAjaxifiedFrameData({}),
							validator : {
								form : form
							},
							msgprocessing : {
								hideMessage : true
							},
							success : this.proxy('_processFileDetailsNextAjax'),
							error : function(xhr, status, error) {
								GtsUtils.processAjaxFrameError(xhr, {});
							}
						});
			} else {
				var cols = [];
				$.each(this.options.config.mapping, $.proxy(function(i, v) {
									cols.push(i + 1)
								}, this));
				this._createCVSMapppingControlls(cols);
				this._setActiveTab(this.elWizardFieldMappingCSV)
			}
		},
		_createCVSMapppingControlls : function(cols) {
			var elInner = $('.col-fields', this.elWizardFieldMappingCSV)
					.empty();
			var data = {
				columns : []
			}

			var rules = {};
			$.each(cols, $.proxy(function(i, v) {
								data.columns.push({
											index : i,
											column : v
										});

								rules['field-' + i] = {
									required : true
								};
							}, this));

			this.elWizardFieldMappingCSV
					.html($.render[this.options.tmpl.csvFieldMapping](data, {
								tmplField : this.options.tmpl.csvFieldMappingField
							}));

			var form = $('form', this.elWizardFieldMappingCSV);
			form.validate({
						rules : rules
					});

			$('.column-field', form).data('gtsFnErrorPlacement',
					this._getFnErrorPlacement()).select2({
						data : this.options.mappingFields,
						matcher1 : function(term, text, opt) {
							var fields = form.data('selectedFields');
							console.log('match', opt)
							return !fields;
						}
					});

			$(form).on('change', '.column-field:input',
					$.proxy(this._onFieldMappingSelect, this));
			this._setActiveTab(this.elWizardFieldMappingCSV);
			if (this.options.config.mapping) {
				var mapping = this.options.config.mapping;
				for (j = 0; j < mapping.length; j++) {
					var fieldName = ":input[name='field-" + j + "']";
					$(fieldName, this.elWizardFieldMappingCSV).select2({
						data : this.options.mappingFields,
						initSelection : $.proxy(function(element, callback) {
							var mappingFields = this.options.mappingFields;
							for (var i = 0; i < mappingFields.length; i++) {
								if (mappingFields[i].id == this.options.config.mapping[j].destination) {
									callback({
												id : mappingFields[i].id,
												text : mappingFields[i].text
											});
									var mappingFieldConfig = this.options.mappingFieldConfigs[this.options.config.mapping[j].destination];

									if (mappingFieldConfig
											&& mappingFieldConfig.settings) {
										$(fieldName,
												this.elWizardFieldMappingCSV)
												.siblings('.field-settings')
												.show();
									} else {
										$(fieldName,
												this.elWizardFieldMappingCSV)
												.siblings('.field-settings')
												.hide();
									}
								}

							}

						}, this)

					}).select2('val',
							this.options.config.mapping[j].destination);;
				}
			}

		},

		_processFileDetailsNextAjax : function(result, status, xhr, $form) {
			GtsUtils.processAjaxFrameSuccess(result, status, xhr, $form);

			if (result._success == true) {

				if (result.line) {
					this._createCVSMapppingControlls(result.cols)
				}

				this._setActiveTab(this.elWizardFieldMappingCSV);
			}
		},
		_getFnErrorPlacement : function() {
			var self = this;
			return function(error, element) {

				var $el = $(element);
				var $parent = $el.parent();
				var $error = $(error)
						.addClass($el.attr('error-placement') == 'inline'
								? 'help-inline'
								: 'help-block');

				$error.insertAfter($el.next());
			};
		},

		_onFieldMappingSelect : function(e) {
			var fields = [];
			var form = $('form', this.elWizardFieldMappingCSV);
			$('.column-field:input', form).each(function(i, v) {
						var val = $(v).val();
						if (val) {
							fields.push(val);
						}
					});
			console.log('selected: ' + fields, arguments)
			form.data('selectedFields', fields);

			var $target = $(e.target)
			var value = $target.val();

			var mappingFieldConfig = this.options.mappingFieldConfigs[value];

			if (mappingFieldConfig && mappingFieldConfig.settings) {
				$target.siblings('.field-settings').show();
			} else {
				$target.siblings('.field-settings').hide();
			}
		},

		_showDateFieldFormatter : function($field) {
			var fieldType = $field.val();
			var html = $.render[this.options.tmpl.fieldFormatDt]({});
			var el = $(html).appendTo(this.el);

			var formats = this.options.mappingFieldConfigs[fieldType].formats;

			var strConfig = $field.data('config');
			var jsonConfig;
			if (strConfig) {
				jsonConfig = strConfig;
			} else {
				var mapping = this.options.config.mapping;
				if (mapping) {
					for (i = 0; i < mapping.length; i++) {
						if (mapping[i].destination == fieldType) {
							jsonConfig = '{"format":"' + mapping[i].format
									+ '"}';
						}
					}
				}
			}

			var formatCreated = false;
			if (jsonConfig) {
				jsonConfig = JSON.parse(jsonConfig);
				if (jsonConfig.format) {
					$(':input[name="format"]', el).select2({
								createSearchChoice : this._customSelect2OptsCreator,
								initSelection : function(element, callback) {
									callback({
												id : jsonConfig.format,
												text : jsonConfig.format
											});
								},
								data : formats
							});

					$(':input[name="format"]', el).select2('val',
							jsonConfig.format).trigger('change');;
					formatCreated = true;
				}
			}

			if (!formatCreated) {
				$(':input[name="format"]', el).select2({
							createSearchChoice : this._customSelect2OptsCreator,
							data : formats
						});

			}

			var $form = $('form', el);
			$form.validate({
						rules : {
							format : {
								required : true
							}
						}
					});

			$('.save-format', el).on('click', $.proxy(function() {
								if (!$form.valid()) {
									return;
								}

								var config = {
									format : $(':input[name="format"]', $form)
											.val()
								}
								$field.data('config', JSON.stringify(config));

								el.modal('hide');
								el.remove();
							}));

			el.modal({
						keyboard : false
					});
		},
		_showDateInOutFormatter : function($field) {
			var fieldType = $field.val();
			var formatCreated = false;
			var html = $.render[this.options.tmpl.inOutFormatDt]({});
			var el = $(html).appendTo(this.el);
			var formats = this.options.mappingFieldConfigs[fieldType].formats;

			var strConfig = $field.data('config');
			var jsonConfig;
			var outformat;
			if (strConfig) {
				jsonConfig = strConfig;
			} else {
				var mapping = this.options.config.mapping;
				if (mapping) {
					for (i = 0; i < mapping.length; i++) {
						if (mapping[i].destination == fieldType) {
							jsonConfig = '{"format":"' + mapping[i].informat
									+ '"}';
							outformat = '{"format":"' + mapping[i].outformat
									+ '"}';
						}
					}
				}
			}

			if (jsonConfig) {
				jsonConfig = JSON.parse(jsonConfig);
				outformat = JSON.parse(outformat);
				if (jsonConfig.format) {
					$(':input[name="inFormat"]', el).select2({
								createSearchChoice : this._customSelect2OptsCreator,
								initSelection : function(element, callback) {
									callback({
												id : jsonConfig.format,
												text : jsonConfig.format
											});
								},
								data : formats
							});

					$(':input[name="inFormat"]', el).select2('val',
							jsonConfig.format).trigger('change');
					formatCreated = true;
				}
				if (outformat.format) {
					$(':input[name="outFormat"]', el).select2({
								createSearchChoice : this._customSelect2OptsCreator,
								initSelection : function(element, callback) {
									callback({
												id : outformat.format,
												text : outformat.format
											});
								},
								data : formats
							});

					$(':input[name="outFormat"]', el).select2('val',
							outformat.format).trigger('change');
					formatCreated = true;

				}
			}
			var formatCreated = false;
			var formats = this.options.mappingFieldConfigs[fieldType].formats;
			if (!formatCreated) {
				$(':input[name="inFormat"]', el).select2({
							createSearchChoice : this._customSelect2OptsCreator,
							multiple : true,
							tags : formats
						});
				$(':input[name="outFormat"]', el).select2({
							createSearchChoice : this._customSelect2OptsCreator,
							multiple : true,
							tags : formats
						});

			}
			var $form = $('form', el);
			$form.validate({
						rules : {
							format : {
								required : true
							}
						}
					});

			$('.save-format', el).on('click', $.proxy(function() {
						if (!$form.valid()) {
							return;
						}

						var config = {
							inFormat : $(':input[name="inFormat"]', $form)
									.val(),
							outFormat : $(':input[name="outFormat"]', $form)
									.val()
						}
						$field.data('config', JSON.stringify(config));
						el.modal('hide');
						el.remove();
					}));

			el.modal({
						keyboard : false
					});
		},
		_doTestConnection : function(e) {
			var currentPanel = this.getActivePanel();
			var form = $('form', currentPanel);
			if (form.length == 1 && form.data('validator') && !form.valid()) {
				return;
			} else {
				$.ajax({
					url : GtsUtils.getContextPath()
							+ '/loader/setup/db/fecthtables',
					data : {
						dbProvider : $(':input[name="dbProvider"]', form).val(),
						dbUserName : $(':input[name="dbUserName"]', form).val(),
						dbPassword : $(':input[name="dbPassword"]', form).val(),
						dbHost : $(':input[name="dbHost"]', form).val(),
						dbName : $(':input[name="dbName"]', form).val(),
						dbSwipeTable : $(':input[name="dbSwipeTable"]', form)
								.val(),
						dbSchemaName : $(':input[name="dbSchemaName"]', form)
								.val(),
						dbPort : $(':input[name="dbPort"]', form).val()

					},
					type : 'POST',
					msgprocessing : {
						hideMessage : true
					}
				}).done($.proxy(function(data) {
					if (data) {
						this.options.tableColumnList = data.tblColumnName;
						if (e) {
							GtsUtils.successMsg("Test Connection Successfull.")
							for (var i = 0; i < data.tableList.length; i++) {
								this.options.dbTableList.push({
											id : data.tableList[i],
											text : data.tableList[i]
										})
							}
						} else {
							var cols = [];
							$.each(this.options.tableColumnList, $.proxy(
											function(i, v) {
												cols.push(v)
											}, this));
							this._createCVSMapppingControlls(cols);
							this._setActiveTab(this.elWizardFieldMappingCSV)
						}
					} else {
						GtsUtils
								.errorMsg('Error while connecting to database.')
					}
				}, this));
			}

		},

		options : {
			storageTypes : [{
						id : 'csv',
						text : 'CSV'
					}, {
						id : 'jdbc',
						text : 'Database'
					}],
			dbTypes : [{
						id : 'postgresql',
						text : 'PostgreSQL'
					}, {
						id : 'mysql',
						text : 'My SQL'
					}, {
						id : 'sqlserver',
						text : 'SQL Server'
					}, {
						id : 'msaccess',
						text : 'MS Access'
					}, {
						id : 'oracle',
						text : 'Oracle'
					}],
			dbTableList : [],
			tableColumnList : [],
			dbPorts : {
				postgresql : {
					port : 5432
				},
				mysql : {
					port : 3306
				},
				sqlserver : {
					port : 1433
				},
				msaccess : {
					port : 1234
				},
				oracle : {
					port : 1521
				}
			},
			fileDateFormats : [{
						id : 0,
						text : 'story'
					}, {
						id : 1,
						text : 'bug'
					}, {
						id : 2,
						text : 'task'
					}],
			mappingFields : [{
						id : 'ignore',
						text : 'Ignore'
					}, {
						id : 'date',
						text : 'Date'
					}, {
						id : 'datetime',
						text : 'Date Time'
					}, {
						id : 'doorname',
						text : 'Door Name'
					}, {
						id : 'employeeno',
						text : 'Employee'
					}, {
						id : 'inout',
						text : 'In/Out Indicator'
					}, {
						id : 'serial',
						text : 'Serial Numner'
					}, {
						id : 'time',
						text : 'Time'
					}],
			mappingFieldConfigs : {
				date : {
					settings : true,
					formats : [{
								id : 'dd-MMM-yyyy',
								text : 'dd-MMM-yyyy'
							}]
				},
				datetime : {
					settings : true,
					formats : [{
								id : 'dd-MMMM-yyyy HH:mm:ss Z',
								text : 'dd-MMMM-yyyy HH:mm:ss Z'
							}]
				},
				time : {
					settings : true,
					formats : [{
								id : 'HH:mm:ss Z',
								text : 'HH:mm:ss Z'
							}]
				},
				inout : {
					settings : true,
					formats : [{
								id : 1,
								text : '1'
							}, {
								id : 0,
								text : '0'
							}]
				}
			},
			tmpl : {
				csvFieldMapping : 'setup-loader-csv-field-mapping',
				csvFieldMappingField : 'setup-loader-csv-field-mapping-field',
				fieldFormatDt : 'setup-loader-field-format-settings-dt',
				inOutFormatDt : 'setup-loader-field-inout-settings'

			}
		}
	});
});