using System;
using FlashCardTool.Application.Decks;
using FlashCardTool.Application.Models;
using MediatR;

namespace FlashCardTool.Application.PractiseSessions;

public record CreatePractiseSessionCommand (Guid DeckId, int CorrectCount, int TotalCount, string? ResponseJson)
: IRequest<CreatePractiseSessionResponse>;

public record CreatePractiseSessionResponse (PractiseSessionDto sessions);

public class CreatePractiseSessionCommandHandle() : IRequestHandler<CreatePractiseSessionCommand, CreatePractiseSessionResponse>
{
    public Task<CreatePractiseSessionResponse> Handle(CreatePractiseSessionCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}