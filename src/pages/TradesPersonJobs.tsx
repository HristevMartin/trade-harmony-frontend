import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Clock, 
  Search, 
  Filter, 
  Star, 
  Calendar,
  Info,
  X
} from 'lucide-react';

const mockJobs = [
  {
    id: '1',
    title: 'Kitchen Sink Leak Repair',
    description: 'Need urgent repair for kitchen sink that has been leaking for 2 days. Under kitchen cabinet is getting wet.',
    location: 'Wandsworth, SW18',
    postedDate: '2 hours ago',
    budget: '£150-£250',
    urgency: 'ASAP',
    category: 'Plumbing',
    applicants: 3
  },
  {
    id: '2',
    title: 'Bathroom Light Installation',
    description: 'Install new LED ceiling lights in main bathroom. 3 lights needed with dimmer switch.',
    location: 'Putney, SW15',
    postedDate: '5 hours ago',
    budget: '£200-£350',
    urgency: 'Within a week',
    category: 'Electrical',
    applicants: 1
  },
  {
    id: '3',
    title: 'Garden Decking Repair',
    description: 'Several loose boards on garden decking need replacing. About 6-8 boards in total.',
    location: 'Richmond, TW9',
    postedDate: '1 day ago',
    budget: '£300-£500',
    urgency: 'Flexible',
    category: 'Carpentry',
    applicants: 7
  }
];

const TradesPersonJobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTooltip, setShowTooltip] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Show one-time tooltip
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('jobs_tooltip_seen');
    if (hasSeenTooltip) {
      setShowTooltip(false);
    }
  }, []);

  const dismissTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('jobs_tooltip_seen', 'true');
  };

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(mockJobs.map(job => job.category))];

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Available Jobs
          </h1>
          <p className="text-muted-foreground">
            Find jobs that match your skills and location
          </p>
        </div>

        {/* One-time Tooltip */}
        {showTooltip && (
          <Card className="mb-6 border-primary bg-primary/5 animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Welcome to your job dashboard!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Use the search and filters below to find jobs that match your skills. 
                      Click on any job to view details and apply.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissTooltip}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                  className="flex items-center gap-1"
                >
                  <Filter className="h-3 w-3" />
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No jobs found matching your criteria. Try adjusting your search or filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer hover-scale">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.postedDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {job.urgency}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{job.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-primary">{job.budget}</span>
                      <span className="text-sm text-muted-foreground">
                        {job.applicants} {job.applicants === 1 ? 'applicant' : 'applicants'}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Empty State Enhancement */}
        {filteredJobs.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredJobs.length} of {mockJobs.length} available jobs
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradesPersonJobs;