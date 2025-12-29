using System;

namespace FlashCardTool.Domain.Exceptions;

public class EntityNotFoundException(string entityName, string entityId)
    : Exception($"Could not find the {entityName} record, using '{entityId}")
{
    public string? EntityId => entityId;
    public string? EntityName => entityName;
}
