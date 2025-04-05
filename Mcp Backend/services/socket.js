export const setupSocket = (io) => {
    io.on('connection', (socket) => {
      console.log('New client connected');
  
      // Join user-specific room
      socket.on('authenticate', (token) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.join(`user_${decoded.id}`);
        } catch (error) {
          socket.disconnect();
        }
      });
  
      // GPS tracking
      socket.on('location_update', (data) => {
        io.to(`mcp_${data.mcpId}`).emit('partner_location', data);
      });
  
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  };