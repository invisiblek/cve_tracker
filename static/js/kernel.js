function openLinks(cve, cve_id) {
  $("#links").empty();

  $.ajax({
    'type': 'POST',
    'url': '/getlinks',
    'contentType': 'application/json',
    'data': JSON.stringify({
             cve_id: cve_id,
            })
  }).done(function(data) {
    $.each(JSON.parse(data), function(i, v) {
      $("#links").append("<a href='" + v.link + "'>" + v.link + "</a><br/>");
    });
    $("#links").dialog('option', 'title', cve).dialog('open');
  });
}

$(document).ready(function() {
  $("#links").dialog({ autoOpen: false,
                       width: 'auto'
                     });
});
