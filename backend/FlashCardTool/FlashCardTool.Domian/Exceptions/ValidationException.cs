using System;

namespace FlashCardTool.Domain.Exceptions;

public class ValidationException(string message) : Exception(message);
