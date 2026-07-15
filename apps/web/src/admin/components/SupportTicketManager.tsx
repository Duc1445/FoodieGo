import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPI, ADMIN_QUERY_KEY, type SupportTicket } from '../../shared/services/admin.api';
import { Button } from '@foodiego/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Textarea } from '@foodiego/ui';
import { LifeBuoy, Eye, Check } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLoading } from './AdminLoading';

export function SupportTicketManager() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const { data: tickets, isLoading } = useQuery({
    queryKey: [ADMIN_QUERY_KEY, 'support-tickets', statusFilter],
    queryFn: () => AdminAPI.getAllTickets(statusFilter ? { status: statusFilter } : undefined),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => AdminAPI.updateTicket(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY, 'support-tickets'] });
      toast.success('Ticket updated');
      if (selectedTicket && selectedTicket.id === variables.id) {
        setSelectedTicket({ ...selectedTicket, ...variables.updates });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update ticket');
    },
  });

  if (isLoading) return <AdminLoading text="Loading tickets..." />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="w-5 h-5" />
              Support Tickets
            </CardTitle>
            <CardDescription>Manage user and merchant support tickets</CardDescription>
          </div>
          <select
            className="px-3 py-2 border border-input bg-background rounded-lg text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_USER">Waiting for User</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {tickets?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No tickets found.</div>
        ) : (
          <div className="space-y-4">
            {tickets?.map(ticket => (
              <div key={ticket.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex-1 mb-4 md:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800">{ticket.ticket_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      ticket.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="text-sm font-medium">{ticket.issue_type.replace(/_/g, ' ')}</div>
                  <div className="text-sm text-slate-500 line-clamp-1">{ticket.description}</div>
                  <div className="text-xs text-slate-400 mt-2">
                    Customer: {ticket.customer_name || ticket.customer_email || ticket.customer_id}
                  </div>
                </div>
                <div className="flex gap-2">
                  {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                    <Button variant="outline" size="sm" onClick={() => updateMutation.mutate({ id: ticket.id, updates: { status: 'RESOLVED' } })}>
                      <Check className="w-4 h-4 mr-2" /> Resolve
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => setSelectedTicket(ticket)}>
                    <Eye className="w-4 h-4 mr-2" /> Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {selectedTicket && (
        <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdate={(updates) => updateMutation.mutate({ id: selectedTicket.id, updates })} />
      )}
    </Card>
  );
}

function TicketModal({ ticket, onClose, onUpdate }: { ticket: SupportTicket, onClose: () => void, onUpdate: (updates: any) => void }) {
  const [internalNotes, setInternalNotes] = useState(ticket.internal_notes || '');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Ticket {ticket.ticket_number}</CardTitle>
              <CardDescription>Created on {new Date(ticket.created_at).toLocaleString()}</CardDescription>
              <CardDescription>Last updated: {new Date(ticket.updated_at).toLocaleString()}</CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Status</p>
              <p className="font-medium">{ticket.status}</p>
            </div>
            <div>
              <p className="text-slate-500">Priority</p>
              <p className="font-medium">{ticket.priority}</p>
            </div>
            <div>
              <p className="text-slate-500">Issue Type</p>
              <p className="font-medium">{ticket.issue_type.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-slate-500">Customer</p>
              <p className="font-medium">{ticket.customer_name || ticket.customer_email || ticket.customer_id}</p>
            </div>
            {ticket.order_id && (
              <div>
                <p className="text-slate-500">Order ID</p>
                <p className="font-medium">{ticket.order_id}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-slate-500 text-sm mb-1">Description</p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md whitespace-pre-wrap text-sm border border-slate-200 dark:border-slate-800">
              {ticket.description}
            </div>
          </div>

          <div>
            <p className="text-slate-500 text-sm mb-1">Internal Notes</p>
            <Textarea
              className="w-full min-h-[100px]"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add internal notes here..."
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onUpdate({ internal_notes: internalNotes })}>
              Save Notes
            </Button>
            <select
              className="px-3 py-2 border border-input bg-background rounded-md text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={ticket.status}
              onChange={(e) => onUpdate({ status: e.target.value })}
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_USER">Waiting for User</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
