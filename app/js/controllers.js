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

  $api('tickets', function(ticketsUrl) {
    self.tickets = $tickets(ticketsUrl);
  });
}