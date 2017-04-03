'use strict'

module.exports = function (array) {
  return array.map(joinRow).join('\n')
}

function joinRow(row) {
  return row.map(escapeCell).join(',')
}

function escapeCell(x) {
  return /,|"/.test(x)
    ? '"' + x + '"'
    : x
}
