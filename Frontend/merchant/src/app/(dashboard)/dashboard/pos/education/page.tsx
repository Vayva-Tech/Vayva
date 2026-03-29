'use client';

import { useState, useEffect } from 'react';
import { POSProvider, usePOS, POSCartItem as CartItemType } from '@/components/pos/POSProvider';
import { Button } from '@vayva/ui/components/ui/button';
import { Input } from '@vayva/ui/components/ui/input';
import { ScrollArea } from '@vayva/ui/components/ui/scroll-area';
import { Badge } from '@vayva/ui/components/ui/badge';
import { Card } from '@vayva/ui/components/ui/card';
import { posApi, POSTable } from '@/lib/pos-api-client';
import { useMerchant } from '@/hooks/useMerchant';
import { toast } from 'sonner';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Award,
  Plus, 
  Minus, 
  Trash2,
  Search,
  Clock,
  Star
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
  price: number;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  enrolled: number;
  capacity: number;
  instructor?: string;
  rating?: number;
}

interface EducationPOSInnerProps {
  storeId: string;
}

function EducationPOSInner({ storeId }: EducationPOSInnerProps) {
  const { addItem, state, removeItem, updateQuantity, calculateTotals } = usePOS();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Load courses
  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const response = await posApi.getItems(storeId, { type: 'SERVICE' });
        if (response.success) {
          const courseData: Course[] = response.data.map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            duration: (item.metadata?.duration as string) || 'Self-paced',
            level: (item.metadata?.level as any) || 'beginner',
            enrolled: Number(item.metadata?.enrolled || 0),
            capacity: Number(item.metadata?.capacity || 100),
            instructor: item.metadata?.instructor as string,
            rating: Number(item.metadata?.rating || 0),
          }));
          setCourses(courseData);
        }
      } catch (error) {
        console.error('Failed to load courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, [storeId]);

  const handleAddToCart = (course: Course) => {
    const cartItem: CartItemType = {
      posItemId: course.id,
      name: `${course.name}`,
      price: course.price,
      quantity: 1,
      discount: 0,
      notes: undefined,
      modifiers: [
        {
          name: 'Level',
          value: course.level.toUpperCase(),
        },
        {
          name: 'Duration',
          value: course.duration,
        },
      ],
    };
    addItem(cartItem);
    toast.success(`Enrolled in ${course.name}`);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchQuery || course.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const totals = calculateTotals();
  const cartItemCount = state.cart.length;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Course Enrollment</h1>
              <p className="text-sm text-gray-500">Register students and enroll in courses</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <Card className="px-4 py-2 bg-green-50 border-green-200">
              <div className="text-xs text-gray-600">Active Students</div>
              <div className="text-lg font-bold text-green-600">234</div>
            </Card>
            <Card className="px-4 py-2 bg-purple-50 border-purple-200">
              <div className="text-xs text-gray-600">Courses Available</div>
              <div className="text-lg font-bold text-purple-600">{courses.length}</div>
            </Card>
          </div>
        </div>

        {/* Student Registration */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Input
            placeholder="Student name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="md:col-span-2"
          />
          <Input
            placeholder="Student email"
            type="email"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
          />
          <Button className="bg-blue-600 hover:bg-blue-700">
            Register Student
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left: Courses Grid */}
        <div className="flex-1 overflow-auto p-4 md:p-6 w-full md:w-auto">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border animate-pulse">
                  <div className="bg-gray-200 h-20 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen className="h-16 w-16 mx-auto mb-4" />
              <p className="text-lg">No courses found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleAddToCart(course)}
                  className="p-4 bg-white rounded-xl border-2 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={course.level === 'advanced' ? 'destructive' : course.level === 'intermediate' ? 'default' : 'secondary'}>
                      {course.level.toUpperCase()}
                    </Badge>
                    {course.rating && (
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <h3 className="font-semibold text-sm line-clamp-2">{course.name}</h3>
                  </div>
                  
                  {course.instructor && (
                    <p className="text-xs text-gray-500 mb-2">
                      By: {course.instructor}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{course.duration}</span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Enrolled:</span>
                      <span className={course.enrolled >= course.capacity ? 'text-red-500' : 'text-green-500'}>
                        {course.enrolled}/{course.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          course.enrolled >= course.capacity ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(course.enrolled / course.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-blue-600">
                      ₦{course.price.toLocaleString()}
                    </div>
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Enrollment Panel */}
        <div className="w-full md:w-96 bg-white border-t md:border-l border-gray-200 flex flex-col h-[50vh] md:h-full fixed md:relative bottom-0 md:bottom-auto z-10 shadow-lg md:shadow-none">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Course Enrollment
            </h2>
            {studentName && (
              <p className="text-sm text-gray-600 mt-1">
                Student: {studentName}
              </p>
            )}
            {studentEmail && (
              <p className="text-sm text-gray-600">
                {studentEmail}
              </p>
            )}
          </div>

          {cartItemCount === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <BookOpen className="h-16 w-16 mb-4 text-blue-300" />
              <p className="text-lg font-medium">No courses selected</p>
              <p className="text-sm">Select courses to enroll student</p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {state.cart.map((item, index) => (
                    <div key={`${item.posItemId}-${index}`} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-500">₦{item.price.toLocaleString()}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:bg-red-50"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 border-blue-200"
                          onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 border-blue-200"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <div className="ml-auto font-bold text-blue-600">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.modifiers.map((mod, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {mod.value}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-gray-200 space-y-2 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₦{totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (7.5%):</span>
                  <span className="font-medium">₦{totals.totalTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-blue-600">
                  <span>Total:</span>
                  <span>₦{totals.total.toLocaleString()}</span>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Complete Enrollment
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function EducationPOS() {
  const storeId = 'store_123';

  return (
    <POSProvider>
      <EducationPOSInner storeId={storeId} />
    </POSProvider>
  );
}
