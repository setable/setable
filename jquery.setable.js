/**
 * Jquery Setable v0.1
 * (c) 2018 kofey zou [kofey@126.com]
 * @license Apache Licence 2.0
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : global.Setable = factory;
}(typeof window !== "undefined" ? window : this, function (setting) {
	'use strict';
	var defaults = {
		// Table id
		container: 'setable',
		// Width of table
		width: '100%',
		// Height of table
		height: '300px',
		// Column types and configurations
		columns: [],
		// Column header titles
		colHeaders: [],
		// Allow column sorting
		colSort: true,
		// Allow column dragging
		colDrag: true,
		// Allow column resizing
		colResize: true,
		// Allow row dragging
		rowDrag: true,
		// Allow row resizing
		rowResize: true,
		// Row height
		rowHeight: '28',
		// Minimal number of rows
		minRows: 2,
		// Minimal number of cols
		minCols: 2,
		// Minimal number of blank rows in the end
		minSpareRows: 0,
		// Minimal number of blank cols in the end
		minSpareCols: 0,
		// Allow new rows
		allowInsertRow: true,
		// Allow new columns
		allowInsertCol: true,
		// Allow row delete
		allowDeleteRow: true,
		// Allow column delete
		allowDeleteCol: true,
		// Custom context menu
		contextMenu: null,
		// Filename for download
		fileName: 'setable'
	};
	var colAttr = {
		// Column type PS:text,symbol,currency,checkbox,dropdown,formula
		type: 'text',
		// Column width
		width: '50',
		// Column alignment
		align: 'center',
		// Column wrap
		wrap: false,
		// Column hidden
		hidden: false,
		// Allow column sorting
		sortable: true,
		// Column editable
		editable: false,
		// Column className
		className: null
	};
	var options = $.extend({}, defaults, setting);
	var PRIV = {
		area: [],
		mult: false,
		creatColGroup: function () {
			GRID.colGroup = '<colgroup><col align="center"/>';
			for (var i = 0; i < options.numCols; i++) {
				GRID.colGroup += '<col width="' + options.columns[i].width + 'px" align="' + options.columns[i].align + '"/>';
			}
			GRID.colGroup += '</colgroup>';
			return this;
		},
		creatThead: function () {
			var len, cnt, i, j, tr = '';
			if (!options.colHeaders || !isArray(options.colHeaders)) {
				GRID.thead = $('<thead>' + this.creatTheadLast([], 1) + '</thead>');
				return;
			}
			len = options.colHeaders.length;
			if (!options.colHeaders[0] || !isArray(options.colHeaders[0]) || len === 1) {
				GRID.thead = $('<thead>' + this.creatTheadLast(options.colHeaders, 1) + '</thead>');
				return;
			}
			cnt = options.colHeaders[0].length;
			for (i = 0; i < len; i++) {
				if (cnt !== options.colHeaders[i].length) {
					GRID.thead = $('<thead>' + this.creatTheadLast(options.colHeaders[len - 1], 1) + '</thead>');
					console.log('表格多级表头标题个数必须相同！');
					return;
				}
				if (i === len - 1) {
					tr += this.creatTheadLast(options.colHeaders[len - 1], i + 1);
				} else {
					tr += '<tr id="H' + (i + 1) + '">';
					if (i === 0) {
						tr += '<th id="H0L0" rowspan="' + len + '"></th>';
					}
					for (j = 0; j < options.numCols; j++) {
						if (options.colHeaders[i][j] !== undefined) {
							var tmp = PRIV.nextUndefinedCnt(options.colHeaders[i], j);
							if (tmp === 1) {
								if (i === 0 || (i > 0 && PRIV.nextUndefinedCnt(options.colHeaders[i - 1], j) !== 1)) {
									if (i === 0 || len === 1 + i) {
										tr += '<th id="H' + (i + 1) + 'L' + (j + 1) + '" rowspan="' + (len - i) + '">' + options.colHeaders[i][j] + '<i class="iconfont">&#xe75b;</i></th>';
									} else {
										tr += '<th id="H' + (i + 1) + 'L' + (j + 1) + '" rowspan="' + (len - i) + '">' + options.colHeaders[i][j] + '</th>';
									}
								}
							} else {
								tr += '<th id="H' + (i + 1) + 'L' + (j + 1) + '" colspan="' + tmp + '">' + options.colHeaders[i][j] + '</th>';
							}
						}
					}
					if (cnt < options.numCols) {
						tr += '<th id="H' + (i + 1) + 'L' + (cnt + 1) + '" colspan="' + (options.numCols - cnt) + '"></th>';
					}
					tr += '</tr>';
				}
			}
			GRID.thead = $('<thead></thead>').append(tr);
			return this;
		},
		creatTheadLast: function (title, deep) {
			var tr = '<tr id="H' + deep + '">';
			if (deep === 0) {
				tr += '<th id="H' + deep + 'L0">';
			}
			for (var i = 0; i < options.numCols; i++) {
				if (title[i] && deep !== 0) {
					tr += '<th id="H' + deep + 'L' + (i + 1) + '">';
					tr += title[i] ? title[i] : getAlphabet(i);
					tr += options.columns[i].sortable ? '<i class="iconfont">&#xe75b;</i></th>' : '</th>';
				}
				if (i >= title.length) {
					tr += '<th id="H' + deep + 'L' + (i + 1) + '">' + getAlphabet(i) + '</th>';
				}
			}
			tr += '</tr>';
			return tr;
		},
		nextUndefinedCnt: function (arr, idx) {
			for (var cnt = 1, len = arr.length; idx + cnt < len && !arr[idx + cnt];) {
				cnt++;
			}
			return cnt;
		},
		ceateTbody: function () {
			// Create cells
			for (var j = 0; j < options.numRows; j++) {
				var tr = $('<tr id="R' + (j + 1) + '"></tr>');
				// Index column
				tr.append('<th id="H' + (j + 1) + 'C0" height="' + options.rowHeight + '">' + (j + 1) + '</th>');
				// Data columns
				for (var i = 0; i < options.numCols; i++) {
					tr.append(this.ceateCell(i, j));
				}
				// Add row to the table body
				GRID.tbody.append(tr);
			}
			// New data available
			if (options.data && typeof (options.onload) === 'function') {
				options.onload(this);
			}
			return this;
		},
		ceateCell: function (i, j) {
			var cell = document.createElement('td');
			cell.id = 'R' + (j + 1) + 'C' + (i + 1);
			if (options.data[j] && options.data[j][i]) {
				cell.innerHTML = this.textRender(options.data[j][i], i);
			}
			if (options.columns[i].type) {
				cell.setAttribute('type', options.columns[i].type);
			}
			// Hidden
			if (options.columns[i].hidden === true) {
				cell.style.display = 'none';
			}
			// Editable
			if (options.columns[i].editable === true) {
				cell.setAttribute('editable', true);
			}
			// Wrap
			if (options.columns[i].wrap === true) {
				cell.style.whiteSpace = 'pre';
			}
			// Add className
			if (options.columns[i].className) {
				cell.className = options.columns[i].className;
			}
			// Render
			if (options.columns[i].render && typeof (options.columns[i].render) === 'function') {
				options.columns[i].render(i, j);
			}
			return cell;
		},
		textRender: function (data, col) {
			if (!options.columns[col] || !options.columns[col].type) {
				return data;
			}
			switch (options.columns[col].type) {
				case 'symbol':
					return data + (options.columns[col].unit || '元');
				case 'currency':
					return (options.columns[col].unit || '￥') + data;
				case 'checkbox':
					return '<input type="checkbox" value="' + data + '"/>';
				case 'dropdown':
					return data + '<i class="iconfont dropdown">&#xe601;</i>';
				case 'formula':
					return this.formula(data);
				default: //text
					if (/^[-\+]?\d+(\.\d+)?$/.test(data) && data < 0) {
						return '<font style="color:red">' + data + '</font>';
					}
					return data;
			}
		},
		quotesCnt: function (str) {
			return str.split('"').length - 1;
		},
		parseCSV: function (str) {
			var r, rlen, rows, c, clen, multiline, last, a = 0,
				arr = [];
			rows = str.split('\n');
			if (rows.length > 1 && rows[rows.length - 1] === '') {
				rows.pop();
			}
			for (r = 0, rlen = rows.length; r < rlen; r += 1) {
				rows[r] = rows[r].split('\t');
				for (c = 0, clen = rows[r].length; c < clen; c += 1) {
					if (!arr[a]) {
						arr[a] = [];
					}
					if (multiline && c === 0) {
						last = arr[a].length - 1;
						arr[a][last] = arr[a][last] + '\n' + rows[r][0];
						if (multiline && (this.quotesCnt(rows[r][0]) & 1)) { //& 1 is a bitwise way of performing mod 2
							multiline = false;
							arr[a][last] = arr[a][last].substring(0, arr[a][last].length - 1).replace(/""/g, '"');
						}
					} else {
						if (c === clen - 1 && rows[r][c].indexOf('"') === 0 && (this.quotesCnt(rows[r][c]) & 1)) {
							arr[a].push(rows[r][c].substring(1).replace(/""/g, '"'));
							multiline = true;
						} else {
							arr[a].push(rows[r][c].replace(/""/g, '"'));
							multiline = false;
						}
					}
				}
				if (!multiline) {
					a += 1;
				}
			}
			return arr;
		},
		stringify: function (arr) {
			var r, rlen, c, clen, val, str = '';
			for (r = 0, rlen = arr.length; r < rlen; r += 1) {
				for (c = 0, clen = arr[r].length; c < clen; c += 1) {
					0 < c && (str += "\t");
					val = arr[r][c];
					if (typeof val === 'string') {
						if (val.indexOf('\n') > -1) {
							str += '"' + val.replace(/"/g, '""') + '"';
						} else {
							str += val;
						}
					} else if (val === null || val === void 0) { //void 0 resolves to undefined
						str += '';
					} else {
						str += val;
					}
				}
				str += '\n';
			}
			return str;
		}
	};
	var EVT = {
		status: null,
		current: null,
		bindToTable: function (action, fn, selector) {
			selector = selector || null;
			GRID.table.on(action, selector, function (event) {
				EVT[fn](event);
			});
		},
		bindToDocu: function (action, fn) {
			$(document).on(action, function (event) {
				EVT[fn](event);
			});
		},
		mouseDown: function (e) {
			if (e.which !== 1) {
				return false;
			}
			if (!$(e.target).is('th,td')) {
				return false;
			}
			this.status = 'down';
			this.current = e.target;
			if (e.target.id === 'H0L0') {
				if (GRID.tbody.prop('selected') === true) {
					GRID.table.find('th,td').removeClass('selected');
					GRID.tbody.prop('selected', false);
				} else {
					GRID.table.find('th,td').addClass('selected');
					GRID.tbody.prop('selected', true);
				}
			} else {
				this.select = new Selection();
				PRIV.area.push(this.select);
				var pos = getPosition(this.current.id),
					type = getPositionType(this.current.id),
					colspan = $(this.current).attr('colspan') || 1,
					rowspan = $(this.current).attr('rowspan') || 1;
				this.select.start(pos, type);
				if (rowspan > 1) {
					pos[0] = pos[0] + parseInt(rowspan) - 1;
				}
				if (colspan > 1) {
					pos[1] = pos[1] + parseInt(colspan) - 1;
				}
				this.select.stop(pos).run();
			}
			e.preventDefault();
			e.stopPropagation();
		},
		mouseMove: function (e) {
			if (!$(e.target).is('th,td')) {
				return false;
			}
			if (this.current && (this.status === 'down' || this.status === 'move')) {
				this.status = 'move';
				var pos = getPosition(e.target.id),
					colspan = $(e.target).attr('colspan') || 1,
					rowspan = $(e.target).attr('rowspan') || 1;
				if (rowspan > 1) {
					pos[0] = pos[0] + parseInt(rowspan) - 1;
				}
				if (colspan > 1) {
					pos[1] = pos[1] + parseInt(colspan) - 1;
				}
				this.select.stop(pos).run();
			}
			e.preventDefault();
			e.stopPropagation();
		},
		mouseUp: function (e) {
			this.status = 'up';
			if (e.which !== 3) {
				GRID.menu.hide();
			}
			e.preventDefault();
			e.stopPropagation();
		},
		dblClick: function (e) {
			this.status = 'double';
			if ($(e.target).parent().is('td') && !$(e.target).is('td')) {
				this.current = $(e.target).parent();
			} else if ($(e.target).is('td')) {
				this.current = $(e.target);
			} else {
				return false;
			}
			var current = this.current,
				history = current.text(),
				pos = getPosition(this.current.attr('id')),
				type = getPositionType(this.current.attr('id'));
			this.select = new Selection();
			this.select.start(pos, type).stop(pos).run();
			if (options.columns[pos[1] - 1].type === 'text') {
				var input = $('<input type="text" value="' + history + '"/>');
				current.empty().append(input);
				input.select().focus();
				input.on('blur focusout', function () {
					current.empty().html(PRIV.textRender(input.val(), pos[1]));
				});
				current.on('mouseleave', function () {
					current.empty().html(PRIV.textRender(input.val(), pos[1]));
				});
			}
			e.preventDefault();
			e.stopPropagation();
		},
		keyUp: function (e) {
			switch (e.which) {
				case 17: // Ctrl
					PRIV.mult = false;
					break;
			}
		},
		keyDown: function (e) {
			switch (e.which) {
				case 17: // Ctrl
					PRIV.mult = true;
					break;
				case 67: // Ctrl + C
					this.copy(e);
					break;
				case 86: // Ctrl + V
					this.paste(e);
					break;
				case 88: // Ctrl + X
					this.copy(e, true);
					break;
			}
		},
		contextMenu: function (e) {
			var type = getPositionType(e.target.id);
			if (!type) {
				return false;
			}
			MENU.set(type, e);
			var pos = $(e.target).position(),
				ew = $(e.target).width() + pos.left,
				eh = $(e.target).height() + pos.top,
				tw = GRID.table.width(),
				th = GRID.table.height(),
				mw = GRID.menu.width(),
				mh = GRID.menu.height();
			GRID.menu.on('mouseleave', function () {
				GRID.menu.hide();
			}).css({
				display: 'block',
				top: ((eh + mh) > th ? (th - mh - 20) : eh) + 'px',
				left: ((ew + mw) > tw ? (tw - mw - 20) : ew) + 'px'
			});
			e.preventDefault();
			e.stopPropagation();
		},
		orderBy: function (e) {
			var idx, src = $(e.target).parent('th');
			GRID.thead.find('i').html('&#xe75b;');
			if (!src.prop('sort')) {
				src.prop('sort', 1);
				$(e.target).html('&#xe67e;');
			} else {
				src.prop('sort', 0);
				$(e.target).html('&#xe67d;');
			}
			idx = getColIdx(src.prop('id')) - 1;
			GRID.orderBy(idx, src.prop('sort'));
		},
		copy: function (e, flag) {
			var clip, data = GRID.copyData(flag);
			if (window.clipboardData || e.clipboardData || (e.originalEvent && e.originalEvent.clipboardData)) {
				clip = window.clipboardData || (e.clipboardData || e.originalEvent.clipboardData);
				clip.clearData('text');
				clip.setData('text', data);
			}
			GRID.clip.text(data);
			GRID.clip.select();
			document.execCommand("copy");
			e.preventDefault();
		},
		paste: function (e) {
			var clip, data;
			if (window.clipboardData) {
				clip = window.clipboardData;
				data = clip.getData('text');
				GRID.clip.text(data);
			} else if (e.clipboardData || (e.originalEvent && e.originalEvent.clipboardData)) {
				clip = e.clipboardData || e.originalEvent.clipboardData;
				data = clip.getData('text');
				GRID.clip.text(data);
			} else {
				data = GRID.clip.val();
			}
			GRID.pasteData(data);
			this.select.corner();
			e.preventDefault();
		}
	};
	var GRID = {
		table: $('<table cellpadding="0" cellspacing="0"></table>'),
		thead: $('<thead></thead>'),
		tbody: $('<tbody></tbody>'),
		corner: $('<div class="corner"></div>'),
		menu: $('<ul class="menu"></ul>'),
		clip: $('<textarea class="textarea"></textarea>'),
		init: function () {
			// Initialize data of table
			if (!options.data) {
				options.data = [];
			}
			if (typeof options.data === 'string') {
				options.data = JSON.parse(options.data);
			}
			// Number of rows
			options.numRows = options.data.length;
			if (options.minRows > options.numRows) {
				options.numRows = options.minRows;
			}
			// Number of columns
			options.numCols = options.data[0] ? options.data[0].length : 0;
			for (var i = 1, l = options.data.length; i < l; i++) {
				if (options.data[i].length > options.numCols) {
					options.numCols = options.data[i].length;
				}
			}
			if (options.minCols > options.numCols) {
				options.numCols = options.minCols;
			}
			// Default column setting
			for (i = 0; i < options.numCols; i++) {
				if (!options.columns[i]) {
					options.columns[i] = colAttr;
				} else {
					options.columns[i] = $.extend({}, colAttr, options.columns[i]);
				}
			}
			PRIV.creatColGroup().creatThead().ceateTbody();
			GRID.table.append(GRID.colGroup, GRID.thead, GRID.tbody, GRID.menu, GRID.clip);
			$('#' + options.container).css('position', 'relative').addClass('setable').append(GRID.table, GRID.corner);
			GRID.bindEvt();
			return this;
		},
		bindEvt: function () {
			EVT.bindToDocu('keyup', 'keyUp');
			EVT.bindToDocu('paste', 'paste');
			EVT.bindToDocu('mouseup', 'mouseUp');
			EVT.bindToDocu('keydown', 'keyDown');
			EVT.bindToTable('mousedown touchstart', 'mouseDown', 'th,td');
			EVT.bindToTable('mousemove', 'mouseMove', 'th,td');
			EVT.bindToTable('click', 'orderBy', 'thead th>i');
			EVT.bindToTable('dblclick touchend', 'dblClick', 'tbody td,tbody td>*');
			EVT.bindToTable('contextmenu', 'contextMenu');
		},
		setData: function (data, pos) {
			if (!pos || !isArray(pos)) {
				pos = this.current ? getPosition(this.current.id) : [1, 1];
			}
			if (typeof data === 'string') {
				data = PRIV.parseCSV(data, '\t');
			}
			for (var i = 0, m = data.length; i < m; i++) {
				for (var j = 0, n = data[i].length; j < n; j++) {
					$('#R' + (i + pos[0]) + 'C' + (j + pos[1])).html(PRIV.textRender(data[i][j], j + pos[1] - 1));
				}
			}
		},
		orderBy: function (idx, sort) {
			function arrsort(x, y) {
				if (/^[-\+]?\d+(\.\d+)?$/.test(x[idx]) && /^[-\+]?\d+(\.\d+)?$/.test(y[idx])) {
					return sort ? x[idx] - y[idx] : y[idx] - x[idx];
				} else {
					return sort ? x[idx].localeCompare(y[idx], 'zh') : y[idx].localeCompare(x[idx], 'zh');
				}
			}
			this.setData(options.data.sort(arrsort), [1, 1]);
			GRID.corner.css({
				'top': '-200px',
				'left': '-200px'
			});
		},
		copyData: function (flag) {
			var data = '',
				len = PRIV.area.length,
				row = [].concat(PRIV.area[0].row),
				col = [].concat(PRIV.area[0].col),
				cells = GRID.tbody.find('td.selected');
			if (len === 0) {
				return '';
			}
			for (var k = 1; k < len; k++) {
				if (PRIV.area[k].row[0] < row[0]) {
					row[0] = PRIV.area[k].row[0];
				}
				if (PRIV.area[k].col[0] < col[0]) {
					col[0] = PRIV.area[k].col[0];
				}
				if (PRIV.area[k].row[1] > row[1]) {
					row[1] = PRIV.area[k].row[1];
				}
				if (PRIV.area[k].col[1] > col[1]) {
					col[1] = PRIV.area[k].col[1];
				}
			}
			for (var i = row[0]; i <= row[1]; i++) {
				var tmp = [];
				for (var j = col[0]; j <= col[1]; j++) {
					var cell = cells.filter('#R' + i + 'C' + j),
						value = this.getCellText(cell);
					tmp[tmp.length] = (value ? value : '');
					flag && cell.empty();
				}
				if (tmp.join('').length > 0) {
					data += tmp.join("\t") + "\n";
				}
			}
			return data;
		},
		pasteData: function (data) {
			var pos = EVT.current ? getPosition(EVT.current.id) : [1, 1];
			if (typeof data === 'string') {
				data = PRIV.parseCSV(data, '\t');
			}
			for (var i = 0, m = data.length; i < m; i++) {
				for (var j = 0, n = data[i].length; j < n; j++) {
					$('#R' + (i + pos[0]) + 'C' + (j + pos[1])).text(data[i][j]);
				}
			}
		},
		getCellText: function (cell) {
			var value = cell.text();
			switch (cell.attr('type')) {
				case 'symbol':
				case 'currency':
					value = value.replace(/\D/g, '');
					break;
				case 'checkbox':
					value = cell.val();
					break;
				case 'dropdown':
					value = $(cell).find('select').val();
					break;
			}
			if (cell.find('input').length) {
				value = $(cell).find('input').val();
			}
			if (value.match(/,/g) || value.match(/\n/)) {
				value = '"' + value + '"';
			}
			return value;
		}
	};
	/**
	 * Create Selection instance
	 */
	var Selection = function () {
		this.row = [];
		this.col = [];
		this.min = [];
		this.max = [];
		this.orig = [];
		this.type = null;
	};
	Selection.prototype.start = function (pos, type) {
		this.orig = pos;
		this.type = type;
		if (this.type === 'head_th') {
			this.orig[0] = 1;
		} else if (this.type === 'body_th') {
			this.orig[1] = 1;
		}
		this.row[0] = this.orig[0];
		this.col[0] = this.orig[1];
		this.max = [].concat(this.orig);
		this.min = [].concat(this.orig);
		return this;
	};
	Selection.prototype.stop = function (pos) {
		if (this.type === 'head_th') {
			pos[0] = options.numRows;
		} else if (this.type === 'body_th') {
			pos[1] = options.numCols;
		}
		this.row[1] = pos[0];
		this.col[1] = pos[1];
		if (this.orig[0] > this.row[1]) {
			this.row[0] = this.row[1];
			this.row[1] = this.orig[0];
		}
		if (this.orig[1] > this.col[1]) {
			this.col[0] = this.col[1];
			this.col[1] = this.orig[1];
		}
		if (this.row[0] < this.min[0]) {
			this.min[0] = this.row[0];
		}
		if (this.col[0] < this.min[1]) {
			this.min[1] = this.col[0];
		}
		if (this.row[1] > this.max[0]) {
			this.max[0] = this.row[1];
		}
		if (this.col[1] > this.max[1]) {
			this.max[1] = this.col[1];
		}
		return this;
	};
	Selection.prototype.clean = function () {
		for (var i = this.min[0]; i <= this.max[0]; i++) {
			$('#H' + i + 'C0').removeClass('selected');
			for (var j = this.min[1]; j <= this.max[1]; j++) {
				$('#H0L' + j).removeClass('selected');
				$('#R' + i + 'C' + j).removeClass('selected bb bt bl br');
			}
		}
		return this;
	};
	Selection.prototype.distory = function () {
		PRIV.area = [this];
		GRID.thead.find('th').removeClass('selected');
		GRID.tbody.find('th').removeClass('selected');
		GRID.tbody.find('td').removeClass('selected first bb bt bl br');
		return this;
	};
	Selection.prototype.range = function () {
		for (var i = this.row[0]; i <= this.row[1]; i++) {
			for (var j = this.col[0]; j <= this.col[1]; j++) {
				$('#R' + i + 'C' + j).addClass('selected');
			}
		}
		// Create borders
		for (var m = this.row[0]; m <= this.row[1]; m++) {
			$('#H' + m + 'C0').addClass('selected');
			// Left border
			$('#R' + m + 'C' + this.col[0]).addClass('bl');
			// Right border
			$('#R' + m + 'C' + this.col[1]).addClass('br');
		}
		for (var n = this.col[0]; n <= this.col[1]; n++) {
			$('#H0L' + n).addClass('selected');
			// Top border
			$('#R' + this.row[0] + 'C' + n).addClass('bt');
			// Bottom border
			$('#R' + this.row[1] + 'C' + n).addClass('bb');
		}
		$('#R' + this.orig[0] + 'C' + this.orig[1]).addClass('first');
		return this;
	};
	Selection.prototype.corner = function () {
		var pos = GRID.table.offset(),
			cell = $("#R" + this.row[1] + "C" + this.col[1]),
			top = parseInt(cell.position().top) + cell.height() + 5,
			left = parseInt(cell.position().left) + cell.width() + 5;
		if (top <= pos.top || top >= pos.top + GRID.table.height() || left <= pos.left || top >= pos.left + GRID.table.width()) {
			GRID.corner.css({
				top: -1E3,
				left: -1E3
			});
		} else {
			GRID.corner.css({
				top: top,
				left: left
			});
		}
	};
	Selection.prototype.run = function () {
		if (PRIV.mult) {
			this.clean().range().corner();
		} else {
			this.distory().range().corner();
		}
	};
	/**
	 * Create MENU instance
	 */
	var MENU = {
		option: {
			head_th: ['cut', 'copy', 'line', 'redo', 'undo', 'del', 'line', 'asc', 'desc', 'inscol', 'delcol', 'line', 'save'],
			body_th: ['cut', 'copy', 'line', 'redo', 'undo', 'del', 'line', 'insrow', 'delrow', 'line', 'save'],
			body_td: ['cut', 'copy', 'paste', 'line', 'redo', 'undo', 'del', 'line', 'insrow', 'delrow', 'inscol', 'delcol', 'line', 'save']
		},
		items: {
			cut: {
				el: $('<li><i class="iconfont">&#xe6f5;</i>剪切<span>Ctrl + X</span></li>'),
				fn: function () {
					EVT.copy(MENU.evt, true);
				}
			},
			copy: {
				el: $('<li><i class="iconfont">&#xe6e6;</i>复制<span>Ctrl + C</span></li>'),
				fn: function () {
					EVT.copy(MENU.evt);
				}
			},
			paste: {
				el: $('<li><i class="iconfont">&#xe6de;</i>粘贴<span>Ctrl + V</span></li>'),
				fn: function () {
					EVT.paste(MENU.evt);
				}
			},
			redo: {
				el: $('<li><i class="iconfont">&#xe612;</i>重做<span>Ctrl + Y</span></li>'),
				fn: function () {}
			},
			undo: {
				el: $('<li><i class="iconfont">&#xe615;</i>恢复<span>Ctrl + Z</span></li>'),
				fn: function () {}
			},
			del: {
				el: $('<li><i class="iconfont">&#xe604;</i>清空<span>Ctrl + DEL</span></li>'),
				fn: function () {}
			},
			asc: {
				el: $('<li><i class="iconfont">&#xe67e;</i>升序<span>Ctrl + &#8593</span></li>'),
				fn: function () {
					var idx = getColIdx(MENU.evt.target.id) - 1;
					GRID.orderBy(idx, 1);
				}
			},
			desc: {
				el: $('<li><i class="iconfont">&#xe67d;</i>降序<span>Ctrl + &#8595</span></li>'),
				fn: function () {
					var idx = getColIdx(MENU.evt.target.id) - 1;
					GRID.orderBy(idx, 0);
				}
			},
			insrow: {
				el: $('<li><i class="iconfont">&#xe6ee;</i>插入行</li>'),
				fn: function () {}
			},
			inscol: {
				el: $('<li><i class="iconfont">&#xe6ed;</i>插入列</li>'),
				fn: function () {}
			},
			delrow: {
				el: $('<li><i class="iconfont">&#xe6f0;</i>删除行</li>'),
				fn: function () {}
			},
			delcol: {
				el: $('<li><i class="iconfont">&#xe6ef;</i>删除列</li>'),
				fn: function () {}
			},
			save: {
				el: $('<li><i class="iconfont">&#xe677;</i>数据导出…<span>Ctrl + S</span></li>'),
				fn: function () {}
			}
		},
		set: function (type, evt) {
			if (!this.option[type]) {
				return false;
			}
			MENU.evt = evt;
			GRID.menu.empty();
			var opt = MENU.option[type];
			for (var x in opt) {
				if (MENU.items.hasOwnProperty(opt[x])) {
					MENU.items[opt[x]].el.on('click', MENU.items[opt[x]].fn);
					GRID.menu.append(MENU.items[opt[x]].el);
				} else {
					GRID.menu.append('<hr/>');
				}
			}
		}
	};

	function isArray(arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	}
	/**
	 * Get row/col num from id
	 *
	 * return object
	 */
	function getPosition(id) {
		if (id && id.match(/\d+/g)) {
			id = id.match(/\d+/g);
			return id.map(function (val) {
				val = Number(val);
				1 > val && (val = 1);
				return val;
			});
		}
		return [1, 1];
	}

	function getColIdx(id) {
		if (!id) {
			return 1;
		}
		id = id.match(/\d+/g);
		return null === id ? 1 : (!id[1] ? 1 : id[1]);
	}
	/**
	 * Get cell nodeType
	 */
	function getPositionType(id) {
		var pattern = {
			'head_tr': /^H[\d]+$/i,
			'body_tr': /^R[\d]+$/i,
			'head_th': /^H[\d]+L[\d]+$/i,
			'body_th': /^H[\d]+C[\d]+$/i,
			'body_td': /^R[\d]+C[\d]+$/i
		};
		for (var key in pattern) {
			if (pattern[key].test(id)) {
				return key;
			}
		}
		return false;
	}
	/**
	 * Get Column Alphabet
	 *
	 * return string
	 */
	function getAlphabet(i) {
		var letter = '';
		if (i > 701) {
			letter += String.fromCharCode(64 + parseInt(i / 676));
			letter += String.fromCharCode(64 + parseInt((i % 676) / 26));
		} else if (i > 25) {
			letter += String.fromCharCode(64 + parseInt(i / 26));
		}
		letter += String.fromCharCode(65 + (i % 26));
		return letter;
	}
	GRID.init();
	this.prototype = GRID;
}));
