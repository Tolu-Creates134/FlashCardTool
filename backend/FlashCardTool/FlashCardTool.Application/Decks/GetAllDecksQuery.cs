using System;
using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Interfaces;
using MediatR;

namespace FlashCardTool.Application.Decks;

public record GetAllDecksQuery() : IRequest<GetAllDecksResponse>;

public record GetAllDecksResponse(DeckListItemDto Decks);

public class GetAllDecksQueryHandler : IRequestHandler<GetAllDecksQuery, GetAllDecksResponse>
{
    private readonly IUnitOfWork unitOfWork;

    private readonly IMapper mapper;

    public GetAllDecksQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        this.unitOfWork = unitOfWork;
        this.mapper = mapper;
    }

    public async Task<GetAllDecksResponse> Handle(GetAllDecksQuery request, CancellationToken cancellationToken)
    {
        var decks = await unitOfWork.Repository<Deck>().GetAllAsync(cancellationToken);
        return mapper.Map<GetAllDecksResponse>(decks);
    }
}
