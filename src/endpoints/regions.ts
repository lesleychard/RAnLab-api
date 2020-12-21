import type {FastifyInstance, RequestGenericInterface} from 'fastify';
import {DataLayer, Region} from "../database/productionDataLayer";

interface GetManagedRegionsRequest extends RequestGenericInterface {
  Params: {
    managerId: string
  }
}

interface CreateRegionRequest extends RequestGenericInterface {
  Body: Region
}

interface DeleteRegionRequest extends RequestGenericInterface {
  Params: {
    regionId: string
  }
}

interface UpdateRegionRequest extends RequestGenericInterface {
  Params: {
    regionId: string
  },
  Body: Region
}

export default function createRegionsEndpoint(app: FastifyInstance, dataLayer : DataLayer) {
  app.get<GetManagedRegionsRequest>('/regions',
    async (request) => {
      let {userId}  = <{userId:string}>await request.jwtVerify();
      let response = {
        statusCode: 200,
        status: "ok",
        date: Date.now(),
        regions: <Region[]>[]
      }
      response.regions.push(...(await dataLayer.getRegionsManagedBy(userId)));
      return JSON.stringify(response);
    }
  );

  app.post<CreateRegionRequest>('/regions',
    async(request, reply) => {
      let response = {
        status: "ok",
        region: request.body.id
      };
      await dataLayer.setRegion(request.body);
      reply.code(201);
      return JSON.stringify(response);
    }
  );

  app.post<UpdateRegionRequest>('/regions/:regionId',
    async(request) => {
      let UpdatedRegion: Region = <Region>{...request.body};
      let response = {
        status: "ok",
        region: UpdatedRegion
      };
      await dataLayer.setRegion(UpdatedRegion);
      return JSON.stringify(response);
    }
  );

  app.delete<DeleteRegionRequest>('/regions/:regionId',
    async (request, reply) => {
      let {userId} = <{userId:string}>await request.jwtVerify();
      if((await dataLayer.getRegionsManagedBy(userId)).find((r) => r.id === request.params.regionId)) {
        await dataLayer.deleteRegion(request.params.regionId);
        reply.code(204);
      } else {
        reply.code(401);
      }
    }
  );
  return app;
}
