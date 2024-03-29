import { ComponentEntityV1alpha1, Entity, getCompoundEntityRef, parseEntityRef, RELATION_API_CONSUMED_BY, RELATION_API_PROVIDED_BY, RELATION_CONSUMES_API, RELATION_OWNED_BY, RELATION_OWNER_OF, RELATION_PROVIDES_API } from '@backstage/catalog-model';
import { CatalogProcessor, CatalogProcessorEmit, LocationSpec, processingResult } from '@backstage/plugin-catalog-backend';

export class DataProductEntitiesProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'DataProductEntitiesProcessor';
  }

  async validateEntityKind(): Promise<boolean> {
    return true
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    const selfRef = getCompoundEntityRef(entity);

    function doEmit(
      targets: string | string[] | undefined,
      context: { defaultKind?: string; defaultNamespace: string },
      outgoingRelation: string,
      incomingRelation: string,
    ): void {
      if (!targets) {
        return;
      }
      for (const target of [targets].flat()) {
        const targetRef = parseEntityRef(target, context);
        emit(
          processingResult.relation({
            source: selfRef,
            type: outgoingRelation,
            target: {
              kind: targetRef.kind,
              namespace: targetRef.namespace,
              name: targetRef.name,
            },
          }),
        );
        emit(
          processingResult.relation({
            source: {
              kind: targetRef.kind,
              namespace: targetRef.namespace,
              name: targetRef.name,
            },
            type: incomingRelation,
            target: selfRef,
          }),
        );
      }
    }

    if (
      entity.kind === 'DataProduct'
    ) {
      const sourceEntity = entity as ComponentEntityV1alpha1;

      const target = sourceEntity.spec.owner;
      if (target) {
        const targetRef = parseEntityRef(target, {
          defaultKind: 'Group',
          defaultNamespace: selfRef.namespace,
        });
      
        emit(
          processingResult.relation({
            source: selfRef,
            type: RELATION_OWNED_BY,
            target: {
              kind: targetRef.kind,
              namespace: targetRef.namespace,
              name: targetRef.name,
            },
          }),
        );
        emit(
          processingResult.relation({
            source: {
              kind: targetRef.kind,
              namespace: targetRef.namespace,
              name: targetRef.name,
            },
            type: RELATION_OWNER_OF,
            target: selfRef,
          }),
        );

        doEmit(
          sourceEntity.spec.providesApis,
          { defaultKind: 'API', defaultNamespace: selfRef.namespace },
          RELATION_PROVIDES_API,
          RELATION_API_PROVIDED_BY,
        );
        doEmit(
          sourceEntity.spec.consumesApis,
          { defaultKind: 'API', defaultNamespace: selfRef.namespace },
          RELATION_CONSUMES_API,
          RELATION_API_CONSUMED_BY,
        );
      }
    }
    return entity;
  }
}