using System;
using FlashCardTool.Application.Models;
using MediatR;

namespace FlashCardTool.Application.PractiseSessions;

public record ListPractiseSessionsByDeckIdQuery (Guid DeckId)
: IRequest<ListPractiseSessionsByDeckIdQueryResponse>;

public record ListPractiseSessionsByDeckIdQueryResponse (List<PractiseSessionDto> sessions);

public class ListPractiseSessionsByDeckIdQueryHandler() : IRequestHandler<ListPractiseSessionsByDeckIdQuery, ListPractiseSessionsByDeckIdQueryResponse>
{
    public Task<ListPractiseSessionsByDeckIdQueryResponse> Handle(ListPractiseSessionsByDeckIdQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}