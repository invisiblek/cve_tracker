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
      if (!v.desc) v.desc = 'No description';
      $("#links").append("<a href='" + v.link + "' target='_blank' >" + v.link + "</a> - " + v.desc + "<br/>");
    });
    $("#links").append("<br><a href='/editcve/" + cve + "'>edit</a>");
    $("#links").dialog('option', 'title', cve).dialog('open');
  });

  $.ajax({
    'type': 'POST',
    'url': '/getnotes',
    'contentType': 'application/json',
    'data': JSON.stringify({
      cve_id: cve_id,
    })
  }).done(function(data) {
    data = JSON.parse(data);
    if (!data[0].notes) {
      data[0].notes = 'No notes';
    }
    $("#links").prepend("<div class='notes'>" + data[0].notes + "</div>");
  });
}

$(document).ready(function() {
  $("#links").dialog({ autoOpen: false,
                       width: 'auto'
                     });
});
