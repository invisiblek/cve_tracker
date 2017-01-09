function deletelink(elem) {
  $("#addlink").dialog('close');
  $("#confirmdeletecve").dialog('close');
  $("#confirmdeletelink").attr("link_id", elem.id);
  $("#yesdeletelink").prop('disabled', false);
  $("#nodeletelink").prop('disabled', false);
  $("#confirmdeletelink").dialog('option', 'title', "Confirm delete?").dialog('open');
}

function addlink() {
  $("#confirmdeletecve").dialog('close');
  $("#confirmdeletelink").dialog('close');
  $("#addlink").dialog('option', 'title', "Enter new link").dialog('open');
}

function deletecve() {
  $("#addlink").dialog('close');
  $("#confirmdeletelink").dialog('close');
  $("#yesdeletecve").prop('disabled', false);
  $("#nodeletecve").prop('disabled', false);
  $("#confirmdeletecve").dialog('option', 'title', "Confirm delete?").dialog('open');
}

$(document).ready(function() {
  $("#addlink").dialog({ autoOpen: false, width: 'auto' });
  $("#confirmdeletecve").dialog({ autoOpen: false, width: 'auto' });
  $("#confirmdeletelink").dialog({ autoOpen: false, width: 'auto' });

  $('#nodeletecve').on('click', function() {
    $("#confirmdeletecve").dialog('close');
  });

  $('#yesdeletecve').on('click', function() {
    $("#yesdeletecve").prop('disabled', true);
    $("#nodeletecve").prop('disabled', true);
    window.location = "/deletecve/" + $("#confirmdeletecve").attr("cve_name")
  });

  $('#nodeletelink').on('click', function() {
    $("#confirmdeletelink").dialog('close');
  });

  $('#yesdeletelink').on('click', function() {
    $("#yesdeletelink").prop('disabled', true);
    $("#nodeletelink").prop('disabled', true);

    link_id = $("#confirmdeletelink").attr("link_id")

    $.ajax({
      'type': 'POST',
      'url': '/deletelink',
      'contentType': 'application/json',
      'data': JSON.stringify({
               link_id: link_id,
              })
    }).done(function(data) {
      if (data.error == "success") {
        $("#linklist > div > a#" + link_id).parent().remove()
        $("#confirmdeletelink").dialog('close');
      } else {
        $("#addlinkerror").empty().append(data.error);
      }
    });
  });

  $('#confirmaddlink').on('click', function() {
    var link_url = $("#linktoadd").val();
    $.ajax({
      'type': 'POST',
      'url': '/addlink',
      'contentType': 'application/json',
      'data': JSON.stringify({
               cve_id: $("#addlink").attr("cve_id"),
               link_url: link_url,
              })
    }).done(function(data) {
      if (data.error == "success") {
        $("#linklist").append("<div><a class='deletelink' onclick='deletelink(this)' id='" + data.link_id + "'>" + link_url + "</a></div>");
        $("#addlink").dialog('close');
      } else {
        $("#addlinkerror").empty().append(data.error);
      }
    });

  });

});
