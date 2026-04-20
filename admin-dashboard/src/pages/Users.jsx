import { useState, useEffect, Fragment } from 'react';
import { mockParents } from '../lib/mockData';
import { Search, ChevronDown, ChevronRight, Star, Zap, Plus, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);

  // Add Parent dialog state
  const [showAddParent, setShowAddParent] = useState(false);
  const [newParent, setNewParent] = useState({ parent_first_name: '', parent_last_name: '', email: '', password: '' });
  const [addParentLoading, setAddParentLoading] = useState(false);
  const [addParentError, setAddParentError] = useState('');

  // Add Child dialog state
  const [showAddChild, setShowAddChild] = useState(false);
  const [addChildParentId, setAddChildParentId] = useState(null);
  const [newChild, setNewChild] = useState({ child_name: '', age: '' });
  const [addChildLoading, setAddChildLoading] = useState(false);
  const [addChildError, setAddChildError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Use mock data
      setUsers(mockParents || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  // --- Add Parent ---
  const handleAddParent = async (e) => {
    e.preventDefault();
    setAddParentError('');

    if (!newParent.parent_first_name || !newParent.parent_last_name || !newParent.email || !newParent.password) {
      setAddParentError('All fields are required.');
      return;
    }

    setAddParentLoading(true);
    try {
      // Mocking the creation by simply pushing to users array for UI update
      setUsers(prev => [...prev, {
        id: `p_new_${Date.now()}`,
        ...newParent,
        created_at: new Date().toISOString(),
        children_list: []
      }]);

      setShowAddParent(false);
      setNewParent({ parent_first_name: '', parent_last_name: '', email: '', password: '' });
    } catch (error) {
      setAddParentError(error.message || 'Failed to add parent.');
    } finally {
      setAddParentLoading(false);
    }
  };

  // --- Add Child ---
  const openAddChild = (parentId, e) => {
    e.stopPropagation();
    setAddChildParentId(parentId);
    setNewChild({ child_name: '', age: '' });
    setAddChildError('');
    setShowAddChild(true);
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    setAddChildError('');

    if (!newChild.child_name) {
      setAddChildError('Child name is required.');
      return;
    }

    if (newChild.age && (isNaN(newChild.age) || newChild.age < 1 || newChild.age > 18)) {
      setAddChildError('Age must be between 1 and 18.');
      return;
    }

    setAddChildLoading(true);
    try {
      // Mocking the creation by updating the users state
      setUsers(prev => prev.map(user => {
        if (user.id === addChildParentId) {
          return {
            ...user,
            children_list: [...(user.children_list || []), {
              id: `c_new_${Date.now()}`,
              ...newChild,
              game_progress: [{ current_level: 1, total_xp: 0, total_stars: 0 }]
            }]
          };
        }
        return user;
      }));

      setShowAddChild(false);
      setNewChild({ child_name: '', age: '' });
      setAddChildParentId(null);
    } catch (error) {
      setAddChildError(error.message || 'Failed to add child.');
    } finally {
      setAddChildLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.parent_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.parent_last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (first, last) => {
    return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
  };

  const addChildParent = users.find(u => u.id === addChildParentId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Parents</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} registered parent {users.length === 1 ? 'account' : 'accounts'}
          </p>
        </div>
        <Button onClick={() => setShowAddParent(true)}>
          <UserPlus className="h-4 w-4" />
          Add Parent
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Children</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const isExpanded = expandedUser === user.id;
              const childrenList = user.children_list || [];
              return (
                <Fragment key={user.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => toggleExpand(user.id)}
                  >
                    <TableCell className="w-10 pr-0">
                      {isExpanded
                        ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(user.parent_first_name, user.parent_last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {user.parent_first_name} {user.parent_last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {childrenList.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow key={`${user.id}-children`}>
                      <TableCell colSpan={5} className="bg-muted/50 p-0">
                        <div className="px-6 py-4">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">
                              {user.parent_first_name}'s Children
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => openAddChild(user.id, e)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add Child
                            </Button>
                          </div>
                          {childrenList.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No children registered yet.</p>
                          ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {childrenList.map((child) => {
                                const progress = child.game_progress?.[0];
                                return (
                                  <div
                                    key={child.id}
                                    className="flex items-start gap-3 rounded-lg border bg-background p-3"
                                  >
                                    <Avatar className="h-9 w-9">
                                      <AvatarFallback className="text-xs font-medium">
                                        {(child.child_name || '?')[0].toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="truncate text-sm font-medium">{child.child_name}</p>
                                        <Badge variant="secondary" className="shrink-0 text-xs">
                                          Lv. {progress?.current_level || 1}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {child.age ? `Age ${child.age}` : 'Age not set'}
                                      </p>
                                      <Separator className="my-2" />
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Zap className="h-3 w-3" />
                                          <span>{progress?.total_xp || 0} XP</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Star className="h-3 w-3" />
                                          <span>{progress?.total_stars || 0}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No parents found matching your search.
          </div>
        )}
      </Card>

      {/* Add Parent Dialog */}
      <Dialog open={showAddParent} onOpenChange={setShowAddParent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Parent</DialogTitle>
            <DialogDescription>
              Create a new parent account. They will be able to log in with these credentials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddParent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  placeholder="John"
                  value={newParent.parent_first_name}
                  onChange={(e) => setNewParent(p => ({ ...p, parent_first_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  placeholder="Doe"
                  value={newParent.parent_last_name}
                  onChange={(e) => setNewParent(p => ({ ...p, parent_last_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@example.com"
                value={newParent.email}
                onChange={(e) => setNewParent(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={newParent.password}
                onChange={(e) => setNewParent(p => ({ ...p, password: e.target.value }))}
              />
            </div>
            {addParentError && (
              <p className="text-sm text-destructive">{addParentError}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddParent(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addParentLoading}>
                {addParentLoading ? 'Creating...' : 'Create Parent'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Child Dialog */}
      <Dialog open={showAddChild} onOpenChange={setShowAddChild}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Child</DialogTitle>
            <DialogDescription>
              Add a new child profile for {addChildParent?.parent_first_name} {addChildParent?.parent_last_name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddChild} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="child_name">Child Name</Label>
              <Input
                id="child_name"
                placeholder="Child's display name"
                value={newChild.child_name}
                onChange={(e) => setNewChild(c => ({ ...c, child_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child_age">Age (optional)</Label>
              <Input
                id="child_age"
                type="number"
                min="1"
                max="18"
                placeholder="e.g. 6"
                value={newChild.age}
                onChange={(e) => setNewChild(c => ({ ...c, age: e.target.value }))}
              />
            </div>
            {addChildError && (
              <p className="text-sm text-destructive">{addChildError}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddChild(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addChildLoading}>
                {addChildLoading ? 'Adding...' : 'Add Child'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
