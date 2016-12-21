function update(c) {
  cve = $(c).attr('cve_id');
  kernel = $(c).attr('kernel_id');
  oldStatus = parseInt($(c).attr('status_id'));
  newStatus = oldStatus == 5 ? 1 : oldStatus + 1;

  $.post("/update",
    {
      kernel: kernel,
      newStatus: newStatus,
      cve: cve,
    }
  ).done(function(data) {
    if (!data.error) {
      $(c).removeClass("status_" + oldStatus);
      $(c).addClass("status_" + data.status_id);
      $(c).attr('status_id', data.status_id);
      $(c).html(data.status);
      $("#progressbar").attr("value", data.patched);
      updateProgressBar();
    }
  });
}

function updateProgressBar() {
  $("#progressbar").progressbar({
    value: parseInt($("#progressbar").attr("value")),
  });
}

$(document).ready(function() {
  updateProgressBar();
});
