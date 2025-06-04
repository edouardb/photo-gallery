
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

import { 
  createPhotoInputSchema, 
  updatePhotoInputSchema, 
  getPhotosInputSchema 
} from './schema';
import { createPhoto } from './handlers/create_photo';
import { getPhotos } from './handlers/get_photos';
import { getPhoto } from './handlers/get_photo';
import { updatePhoto } from './handlers/update_photo';
import { deletePhoto } from './handlers/delete_photo';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Photo gallery endpoints
  createPhoto: publicProcedure
    .input(createPhotoInputSchema)
    .mutation(({ input }) => createPhoto(input)),
    
  getPhotos: publicProcedure
    .input(getPhotosInputSchema.optional())
    .query(({ input }) => getPhotos(input)),
    
  getPhoto: publicProcedure
    .input(z.number())
    .query(({ input }) => getPhoto(input)),
    
  updatePhoto: publicProcedure
    .input(updatePhotoInputSchema)
    .mutation(({ input }) => updatePhoto(input)),
    
  deletePhoto: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deletePhoto(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
