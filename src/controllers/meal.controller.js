import prisma from "../lib/prisma.js";

// GET /meals/menu - Get weekly menu
export async function getWeeklyMenu(req, res, next) {
  try {
    const menu = await prisma.weekly_food_menu.findMany({
      orderBy: [
        { day: 'asc' },
        { meal_type: 'asc' }
      ],
    });

    // Group by day for easier frontend consumption
    const groupedMenu = {};
    menu.forEach(item => {
      if (!groupedMenu[item.day]) {
        groupedMenu[item.day] = {};
      }
      groupedMenu[item.day][item.meal_type] = item.menu_items;
    });

    res.json(groupedMenu);
  } catch (err) {
    next(err);
  }
}

// POST /meals/menu - Create/Update menu (Admin/Warden)
export async function createMenu(req, res, next) {
  try {
    const { day, meal_type, menu_items } = req.body;

    if (!day || !meal_type || !menu_items) {
      return res.status(400).json({ 
        error: "day, meal_type, and menu_items are required" 
      });
    }

    // Check if menu item already exists
    const existing = await prisma.weekly_food_menu.findFirst({
      where: {
        day: day.toLowerCase(),
        meal_type: meal_type.toLowerCase(),
      },
    });

    let menuItem;
    if (existing) {
      // Update existing
      menuItem = await prisma.weekly_food_menu.update({
        where: { id: existing.id },
        data: { menu_items },
      });
    } else {
      // Create new
      menuItem = await prisma.weekly_food_menu.create({
        data: {
          day: day.toLowerCase(),
          meal_type: meal_type.toLowerCase(),
          menu_items,
        },
      });
    }

    res.json(menuItem);
  } catch (err) {
    next(err);
  }
}

// GET /meals/bookings/my - Get student's bookings
export async function getMyBookings(req, res, next) {
  try {
    const bookings = await prisma.meal_bookings.findMany({
      where: { student_id: req.user.id },
      orderBy: { date: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

// POST /meals/bookings - Create booking
export async function createBooking(req, res, next) {
  try {
    const { date, breakfast, lunch, dinner } = req.body;

    if (!date) {
      return res.status(400).json({ error: "date is required" });
    }

    // Validate date (can't book past dates)
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({ error: "Cannot book meals for past dates" });
    }

    // Check if booking already exists for this date
    const existing = await prisma.meal_bookings.findFirst({
      where: {
        student_id: req.user.id,
        date: bookingDate,
      },
    });

    let booking;
    if (existing) {
      // Update existing booking
      booking = await prisma.meal_bookings.update({
        where: { id: existing.id },
        data: {
          breakfast: breakfast ?? false,
          lunch: lunch ?? false,
          dinner: dinner ?? false,
        },
      });
    } else {
      // Create new booking
      booking = await prisma.meal_bookings.create({
        data: {
          student_id: req.user.id,
          date: bookingDate,
          breakfast: breakfast ?? false,
          lunch: lunch ?? false,
          dinner: dinner ?? false,
        },
      });
    }

    res.json(booking);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: "Booking already exists for this date" });
    }
    next(err);
  }
}

// DELETE /meals/bookings/:id - Cancel booking
export async function cancelBooking(req, res, next) {
  try {
    const bookingId = req.params.id;

    const booking = await prisma.meal_bookings.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if user owns this booking
    if (booking.student_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if booking is for today or future (can't cancel past meals)
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({ error: "Cannot cancel past meal bookings" });
    }

    await prisma.meal_bookings.delete({
      where: { id: bookingId },
    });

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    next(err);
  }
}

// GET /meals/bookings/date/:date - Get bookings for specific date (Admin/Warden)
export async function getBookingsByDate(req, res, next) {
  try {
    const { date } = req.params;

    const bookings = await prisma.meal_bookings.findMany({
      where: {
        date: new Date(date),
      },
      include: {
        profiles: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

// GET /meals/stats - Get meal statistics with comparisons (Admin/Warden)
export async function getMealStats(req, res, next) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
  
      // Get total students count
      const totalStudents = await prisma.profiles.count({
        where: {
          role: 'student',
        },
      });
  
      // Get today's bookings
      const todayBookings = await prisma.meal_bookings.findMany({
        where: {
          date: today,
        },
      });
  
      // Get yesterday's bookings
      const yesterdayBookings = await prisma.meal_bookings.findMany({
        where: {
          date: yesterday,
        },
      });
  
      // Count unique students who booked today
      const uniqueStudentsToday = new Set(todayBookings.map(b => b.student_id)).size;
      
      // Count unique students who booked yesterday
      const uniqueStudentsYesterday = new Set(yesterdayBookings.map(b => b.student_id)).size;
  
      const stats = {
        totalStudents,
        today: {
          date: today.toISOString().split('T')[0],
          totalBookings: todayBookings.length,
          uniqueStudents: uniqueStudentsToday,
          breakfast: todayBookings.filter(b => b.breakfast).length,
          lunch: todayBookings.filter(b => b.lunch).length,
          dinner: todayBookings.filter(b => b.dinner).length,
          studentsNotBooked: totalStudents - uniqueStudentsToday,
          bookingPercentage: totalStudents > 0 ? Math.round((uniqueStudentsToday / totalStudents) * 100) : 0,
        },
        yesterday: {
          date: yesterday.toISOString().split('T')[0],
          totalBookings: yesterdayBookings.length,
          uniqueStudents: uniqueStudentsYesterday,
          breakfast: yesterdayBookings.filter(b => b.breakfast).length,
          lunch: yesterdayBookings.filter(b => b.lunch).length,
          dinner: yesterdayBookings.filter(b => b.dinner).length,
        },
        comparison: {
          bookingChange: todayBookings.length - yesterdayBookings.length,
          studentChange: uniqueStudentsToday - uniqueStudentsYesterday,
          breakfastChange: todayBookings.filter(b => b.breakfast).length - yesterdayBookings.filter(b => b.breakfast).length,
          lunchChange: todayBookings.filter(b => b.lunch).length - yesterdayBookings.filter(b => b.lunch).length,
          dinnerChange: todayBookings.filter(b => b.dinner).length - yesterdayBookings.filter(b => b.dinner).length,
        },
      };
  
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }