using System;

namespace FlashCardTool.Domain.Exceptions;

public class ForbiddenOperationException(string message) : Exception(message);
