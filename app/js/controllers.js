/**
 * TicketListCtrl
 * 
 * Just loads all tickets immediately...
 * 
 * @param $api $api service
 * @param $tickets $tickets service
 */
function TicketListCtrl($api, $tickets) {
  var self = this;
  this.loadComments = $tickets.loadComments;

  $api('tickets', function(ticketsUrl) {
    self.tickets = $tickets(ticketsUrl);
  });
}